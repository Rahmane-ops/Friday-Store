import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  buildDeletedUserTombstone,
  isValidTargetUserId,
  parseServiceAccountJson,
} from './src/utils/userDeletion.ts';

interface FirebaseAppletConfig {
  projectId: string;
  apiKey: string;
  firestoreDatabaseId?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as FirebaseAppletConfig;

const parsedServiceAccount = parseServiceAccountJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

if (parsedServiceAccount) {
  try {
    adminApp =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert({
              projectId: parsedServiceAccount.project_id,
              clientEmail: parsedServiceAccount.client_email,
              privateKey: parsedServiceAccount.private_key,
            }),
            projectId: firebaseConfig.projectId,
          });
    adminAuth = getAuth(adminApp);
    adminDb = firebaseConfig.firestoreDatabaseId
      ? getFirestore(adminApp, firebaseConfig.firestoreDatabaseId)
      : getFirestore(adminApp);
  } catch (err) {
    console.error('Firebase Admin initialization skipped:', err);
    adminApp = null;
    adminAuth = null;
    adminDb = null;
  }
}

interface VerifiedCaller {
  uid: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
}

async function verifyAdminBearerToken(authHeader?: string): Promise<VerifiedCaller | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) return null;

  if (adminAuth && adminDb) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken, true);
      const email = (decoded.email || '').trim().toLowerCase();
      const emailVerified = decoded.email_verified === true;
      const isBootstrapped = email === BOOTSTRAPPED_ADMIN_EMAIL && emailVerified;

      if (isBootstrapped) {
        return { uid: decoded.uid, email, emailVerified, isAdmin: true };
      }

      const adminDoc = await adminDb.doc(`admins/${decoded.uid}`).get();
      if (adminDoc.exists) {
        return { uid: decoded.uid, email, emailVerified, isAdmin: true };
      }

      const userDoc = await adminDb.doc(`users/${decoded.uid}`).get();
      const userData = userDoc.data() as { role?: string; status?: string } | undefined;
      const hasAdminRole = userData?.role === 'admin' && userData?.status === 'active';

      return { uid: decoded.uid, email, emailVerified, isAdmin: hasAdminRole };
    } catch {
      return null;
    }
  }

  // Fallback verification via Firebase Identity Toolkit + Firestore REST when Service Account is not configured
  try {
    const lookupRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!lookupRes.ok) return null;
    const lookupJson = (await lookupRes.json()) as {
      users?: Array<{
        localId?: string;
        email?: string;
        emailVerified?: boolean;
        disabled?: boolean;
      }>;
    };
    const userInfo = lookupJson.users?.[0];
    if (!userInfo?.localId || userInfo.disabled) return null;

    const uid = userInfo.localId;
    const email = (userInfo.email || '').trim().toLowerCase();
    const emailVerified = userInfo.emailVerified === true;

    if (email === BOOTSTRAPPED_ADMIN_EMAIL && emailVerified) {
      return { uid, email, emailVerified, isAdmin: true };
    }

    const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
    const adminDocUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebaseConfig.projectId)}/databases/${encodeURIComponent(dbId)}/documents/admins/${encodeURIComponent(uid)}`;
    const adminRes = await fetch(adminDocUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (adminRes.ok) {
      return { uid, email, emailVerified, isAdmin: true };
    }

    const userDocUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebaseConfig.projectId)}/databases/${encodeURIComponent(dbId)}/documents/users/${encodeURIComponent(uid)}`;
    const userRes = await fetch(userDocUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (userRes.ok) {
      const docJson = (await userRes.json()) as {
        fields?: {
          role?: { stringValue?: string };
          status?: { stringValue?: string };
        };
      };
      const isRoleAdmin =
        docJson.fields?.role?.stringValue === 'admin' &&
        docJson.fields?.status?.stringValue === 'active';
      return { uid, email, emailVerified, isAdmin: isRoleAdmin };
    }

    return { uid, email, emailVerified, isAdmin: false };
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/admin/auth-capabilities', async (req: Request, res: Response) => {
    const caller = await verifyAdminBearerToken(req.headers.authorization);
    if (!caller || !caller.isAdmin) {
      res.status(403).json({ error: 'Accès administrateur requis.' });
      return;
    }
    res.json({
      adminSdkConfigured: Boolean(adminAuth && adminDb),
      projectId: firebaseConfig.projectId,
    });
  });

  app.delete('/api/admin/users/:userId', async (req: Request, res: Response) => {
    const targetUserId = String(req.params.userId || '').trim();
    if (!isValidTargetUserId(targetUserId)) {
      res.status(400).json({ error: 'Identifiant utilisateur invalide.' });
      return;
    }

    const caller = await verifyAdminBearerToken(req.headers.authorization);
    if (!caller || !caller.isAdmin) {
      res.status(403).json({ error: 'Accès administrateur requis.' });
      return;
    }

    if (!adminAuth || !adminDb) {
      res.json({
        ok: true,
        authDeleted: false,
        firestoreCleaned: false,
        reason: 'MISSING_SERVICE_ACCOUNT',
      });
      return;
    }

    try {
      // Check target user before deletion to protect primary bootstrapped admin if needed
      let authNotFound = false;
      try {
        const targetRecord = await adminAuth.getUser(targetUserId);
        if ((targetRecord.email || '').toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL && targetUserId !== caller.uid) {
          res.status(403).json({ error: 'Le compte super-administrateur principal ne peut pas être supprimé.' });
          return;
        }
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code === 'auth/user-not-found') {
          authNotFound = true;
        } else {
          throw err;
        }
      }

      if (!authNotFound) {
        await adminAuth.deleteUser(targetUserId);
      }

      // Purge Firestore documents + user notifications + write zero-PII revocation tombstone
      const batch = adminDb.batch();
      batch.delete(adminDb.doc(`users/${targetUserId}`));
      batch.delete(adminDb.doc(`admins/${targetUserId}`));

      const notificationsSnap = await adminDb
        .collection('notifications')
        .where('userId', '==', targetUserId)
        .get();
      let notificationsDeleted = 0;
      notificationsSnap.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
        notificationsDeleted += 1;
      });

      const tombstone = buildDeletedUserTombstone({
        userId: targetUserId,
        deletedBy: caller.uid,
        authDeleted: true,
      });
      batch.set(adminDb.doc(`deletedUsers/${targetUserId}`), tombstone);

      await batch.commit();

      res.json({
        ok: true,
        authDeleted: true,
        firestoreCleaned: true,
        notificationsDeleted,
      });
    } catch (err) {
      console.error('Failed to permanently delete user via Admin SDK:', err);
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Erreur lors de la suppression Firebase Admin.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Friday Store server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
