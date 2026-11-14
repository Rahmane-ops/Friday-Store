import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppUser, UserRole, UserStatus } from '../types';
import { auth, db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/firestoreError';
import {
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateAuthProfile,
  deleteUser as firebaseDeleteAuthUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  AdminDeleteUserResult,
  SelfDeleteAccountResult,
  buildDeletedUserTombstone,
  isRecentAuthSession,
} from '../utils/userDeletion';

interface AuthContextType {
  currentUser: AppUser | null;
  users: AppUser[];
  authReady: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    pass: string;
    displayName: string;
    phone: string;
    address?: string;
    city?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, newStatus: UserStatus) => Promise<void>;
  updateProfile: (data: Partial<AppUser>) => Promise<void>;
  deleteUser: (userId: string) => Promise<AdminDeleteUserResult>;
  deleteMyAccount: (password?: string) => Promise<SelfDeleteAccountResult>;
  adminAuthDeletionReady: boolean | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email ou mot de passe incorrect. Vérifiez vos identifiants.';
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cette adresse email.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/invalid-email':
      return 'Adresse email invalide.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Connexion Google annulée.';
    case 'auth/popup-blocked':
      return 'La fenêtre Google a été bloquée par votre navigateur. Autorisez les popups et réessayez.';
    case 'auth/operation-not-allowed':
      return "La connexion par email/mot de passe n'est pas activée dans la console Firebase. Utilisez « Continuer avec Google » ou activez Email/Mot de passe dans Firebase Authentication.";
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé. Contactez le support Friday Store.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.';
    default:
      return error instanceof Error ? error.message : 'Erreur d’authentification Firebase.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [adminAuthDeletionReady, setAdminAuthDeletionReady] = useState<boolean | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const pendingProfileRef = useRef<{
    displayName?: string;
    phone?: string;
    address?: string;
    city?: string;
  } | null>(null);
  const syncInFlightRef = useRef<Map<string, Promise<AppUser>>>(new Map());

  const performSyncUserDocument = async (
    firebaseUser: FirebaseUser,
    overrideProfile?: { displayName?: string; phone?: string; address?: string; city?: string }
  ): Promise<AppUser> => {
    const effectiveProfile = overrideProfile || pendingProfileRef.current || undefined;
    const userPath = `users/${firebaseUser.uid}`;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const email = (firebaseUser.email || '').trim().toLowerCase();
    const isBootstrappedAdmin =
      email === BOOTSTRAPPED_ADMIN_EMAIL && firebaseUser.emailVerified === true;
    const nowIso = new Date().toISOString();

    const deletedPath = `deletedUsers/${firebaseUser.uid}`;
    const deletedRef = doc(db, 'deletedUsers', firebaseUser.uid);
    try {
      const deletedSnap = await getDoc(deletedRef);
      if (deletedSnap.exists()) {
        try {
          await firebaseDeleteAuthUser(firebaseUser);
        } catch {
          await firebaseSignOut(auth);
        }
        throw new Error(
          'Ce compte et ses identifiants ont été supprimés définitivement. Créez un nouveau compte si nécessaire.'
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('supprimés définitivement')) {
        throw err;
      }
      // Ignore transient/rules error if deletedUsers doesn't apply, proceed to users check
      void deletedPath;
    }

    let snap;
    try {
      snap = await getDoc(userRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, userPath);
    }

    if (snap && snap.exists()) {
      const existingData = snap.data() as AppUser;
      if (existingData.status === 'suspended') {
        await firebaseSignOut(auth);
        throw new Error(
          "⛔ Ce compte a été suspendu par l'administration Friday Store. Veuillez contacter le support WhatsApp."
        );
      }

      const registrationPatch: Partial<AppUser> = {};
      if (effectiveProfile?.displayName?.trim()) {
        registrationPatch.displayName = effectiveProfile.displayName.trim().slice(0, 160);
      }
      if (effectiveProfile?.phone?.trim()) {
        registrationPatch.phone = effectiveProfile.phone.trim().slice(0, 32);
      }
      if (effectiveProfile?.address?.trim()) {
        registrationPatch.address = effectiveProfile.address.trim().slice(0, 300);
      }
      if (effectiveProfile?.city?.trim()) {
        registrationPatch.city = effectiveProfile.city.trim().slice(0, 120);
      }

      // Ensure bootstrapped admin always retains admin role + admins/{uid} entry
      if (isBootstrappedAdmin && existingData.role !== 'admin') {
        try {
          await updateDoc(userRef, { ...registrationPatch, role: 'admin', lastLogin: nowIso });
          await setDoc(doc(db, 'admins', firebaseUser.uid), {
            uid: firebaseUser.uid,
            email,
            assignedAt: nowIso,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, userPath);
        }
        return { ...existingData, ...registrationPatch, role: 'admin', lastLogin: nowIso };
      }

      if (isBootstrappedAdmin) {
        setDoc(
          doc(db, 'admins', firebaseUser.uid),
          { uid: firebaseUser.uid, email, assignedAt: nowIso },
          { merge: true }
        ).catch(() => {});
      }

      try {
        await updateDoc(userRef, { ...registrationPatch, lastLogin: nowIso });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, userPath);
      }
      return { ...existingData, ...registrationPatch, lastLogin: nowIso };
    }

    const newUser: AppUser = {
      id: firebaseUser.uid,
      email: email || `${firebaseUser.uid}@fridaystore.sn`,
      displayName: (
        effectiveProfile?.displayName ||
        firebaseUser.displayName ||
        email.split('@')[0] ||
        'Client Friday Store'
      )
        .trim()
        .slice(0, 160),
      phone: (effectiveProfile?.phone || firebaseUser.phoneNumber || '').trim().slice(0, 32),
      role: isBootstrappedAdmin ? 'admin' : 'user',
      status: 'active',
      address: (effectiveProfile?.address || '').trim().slice(0, 300),
      city: (effectiveProfile?.city || 'Dakar').trim().slice(0, 120),
      ...(firebaseUser.photoURL ? { avatarUrl: firebaseUser.photoURL.slice(0, 500) } : {}),
      createdAt: nowIso,
      lastLogin: nowIso,
    };

    try {
      await setDoc(userRef, newUser);
      if (isBootstrappedAdmin) {
        await setDoc(doc(db, 'admins', firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: newUser.email,
          assignedAt: nowIso,
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, userPath);
    }

    return newUser;
  };

  const syncUserDocument = async (
    firebaseUser: FirebaseUser,
    overrideProfile?: { displayName?: string; phone?: string; address?: string; city?: string }
  ): Promise<AppUser> => {
    const existingSync = syncInFlightRef.current.get(firebaseUser.uid);
    if (existingSync && !overrideProfile) {
      return existingSync;
    }

    const runSync = async () => {
      if (existingSync) {
        await existingSync.catch(() => {});
      }
      return performSyncUserDocument(firebaseUser, overrideProfile);
    };

    const promise = runSync();
    syncInFlightRef.current.set(firebaseUser.uid, promise);
    try {
      return await promise;
    } finally {
      if (syncInFlightRef.current.get(firebaseUser.uid) === promise) {
        syncInFlightRef.current.delete(firebaseUser.uid);
      }
    }
  };

  // Real Firebase Auth listener — never auto-logs in any demo/local user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setUsers([]);
        setAuthReady(true);
        return;
      }

      try {
        const synced = await syncUserDocument(firebaseUser);
        setCurrentUser(synced);
      } catch (err) {
        console.error('Auth sync error:', err);
        setCurrentUser(null);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'admin' && currentUser?.status === 'active';

  // Stream real Firestore users ONLY when authenticated user is verified Admin
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setUsers([]);
      setAdminAuthDeletionReady(null);
      return;
    }

    // Check whether backend Firebase Admin SDK is configured for instant Auth deletion
    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const res = await fetch('/api/admin/auth-capabilities', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as { adminSdkConfigured?: boolean };
          setAdminAuthDeletionReady(Boolean(data.adminSdkConfigured));
        }
      } catch {
        setAdminAuthDeletionReady(false);
      }
    })();

    const path = 'users';
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data() as AppUser);
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setUsers(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [authReady, isAdmin]);

  // Real-time revocation watcher: kicks out active session immediately if admin deletes the account
  useEffect(() => {
    if (!authReady || !currentUser?.id) return;
    const deletedRef = doc(db, 'deletedUsers', currentUser.id);
    const unsubscribe = onSnapshot(
      deletedRef,
      async (snap) => {
        if (snap.exists()) {
          const activeFbUser = auth.currentUser;
          setCurrentUser(null);
          setUsers([]);
          if (activeFbUser) {
            try {
              await firebaseDeleteAuthUser(activeFbUser);
            } catch {
              await firebaseSignOut(auth);
            }
          }
        }
      },
      () => {
        // Ignore listener teardown errors after signOut/self-delete
      }
    );

    return () => unsubscribe();
  }, [authReady, currentUser?.id]);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      const synced = await syncUserDocument(credential.user);
      setCurrentUser(synced);
      closeAuthModal();
      return { success: true };
    } catch (err) {
      return { success: false, error: mapFirebaseAuthError(err) };
    }
  };

  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      return { success: false, error: 'Veuillez saisir votre email et votre mot de passe.' };
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const synced = await syncUserDocument(credential.user);
      setCurrentUser(synced);
      closeAuthModal();
      return { success: true };
    } catch (err) {
      return { success: false, error: mapFirebaseAuthError(err) };
    }
  };

  const register = async (data: {
    email: string;
    pass: string;
    displayName: string;
    phone: string;
    address?: string;
    city?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail || !data.pass || !data.displayName.trim()) {
      return { success: false, error: 'Tous les champs obligatoires doivent être renseignés.' };
    }

    pendingProfileRef.current = {
      displayName: data.displayName,
      phone: data.phone,
      address: data.address,
      city: data.city,
    };

    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, data.pass);
      await firebaseUpdateAuthProfile(res.user, {
        displayName: data.displayName.trim().slice(0, 160),
      }).catch(() => {});

      const synced = await syncUserDocument(res.user, {
        displayName: data.displayName,
        phone: data.phone,
        address: data.address,
        city: data.city,
      });
      setCurrentUser(synced);
      closeAuthModal();
      return { success: true };
    } catch (err) {
      return { success: false, error: mapFirebaseAuthError(err) };
    } finally {
      pendingProfileRef.current = null;
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return {
        success: false,
        error: 'Saisissez votre adresse email ci-dessus pour recevoir le lien de réinitialisation.',
      };
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true };
    } catch (err) {
      return { success: false, error: mapFirebaseAuthError(err) };
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setUsers([]);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!isAdmin) return;
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      if (newRole === 'admin') {
        const target = users.find((u) => u.id === userId);
        await setDoc(doc(db, 'admins', userId), {
          uid: userId,
          email: target?.email || '',
          assignedAt: new Date().toISOString(),
        });
      } else {
        await deleteDoc(doc(db, 'admins', userId)).catch(() => {});
      }
      if (currentUser && currentUser.id === userId) {
        setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: UserStatus) => {
    if (!isAdmin) return;
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      if (currentUser && currentUser.id === userId) {
        setCurrentUser((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const updateProfile = async (data: Partial<AppUser>) => {
    if (!currentUser) return;
    const path = `users/${currentUser.id}`;
    const safePatch: Partial<Pick<AppUser, 'displayName' | 'phone' | 'address' | 'city'>> = {};
    if (typeof data.displayName === 'string') {
      safePatch.displayName = data.displayName.trim().slice(0, 160);
    }
    if (typeof data.phone === 'string') {
      safePatch.phone = data.phone.trim().slice(0, 32);
    }
    if (typeof data.address === 'string') {
      safePatch.address = data.address.trim().slice(0, 300);
    }
    if (typeof data.city === 'string') {
      safePatch.city = data.city.trim().slice(0, 120);
    }

    try {
      await updateDoc(doc(db, 'users', currentUser.id), safePatch);
      setCurrentUser((prev) => (prev ? { ...prev, ...safePatch } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteUser = async (userId: string): Promise<AdminDeleteUserResult> => {
    if (!isAdmin) {
      return { success: false, authDeleted: false, error: 'Action réservée aux administrateurs.' };
    }

    const target = users.find((u) => u.id === userId);
    if (
      target?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL &&
      currentUser?.id !== userId
    ) {
      return {
        success: false,
        authDeleted: false,
        error: 'Le compte super-administrateur principal ne peut pas être supprimé.',
      };
    }

    let authDeletedOnServer = false;
    let firestoreCleanedOnServer = false;

    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const payload = (await response.json()) as {
            authDeleted?: boolean;
            firestoreCleaned?: boolean;
          };
          authDeletedOnServer = Boolean(payload.authDeleted);
          firestoreCleanedOnServer = Boolean(payload.firestoreCleaned);
        }
      }
    } catch {
      // Fallback to client Firestore purge + revocation tombstone
    }

    const path = `users/${userId}`;
    if (!firestoreCleanedOnServer) {
      try {
        // 1. Write revocation tombstone FIRST (zero PII) so active sessions & rules lock immediately
        const tombstone = buildDeletedUserTombstone({
          userId,
          deletedBy: currentUser?.id || 'admin',
          authDeleted: authDeletedOnServer,
        });
        await setDoc(doc(db, 'deletedUsers', userId), tombstone);

        // 2. Delete user's private notifications
        const notifSnap = await getDocs(
          query(collection(db, 'notifications'), where('userId', '==', userId))
        );
        await Promise.all(notifSnap.docs.map((d) => deleteDoc(d.ref)));

        // 3. Delete Firestore profile & admin index
        await deleteDoc(doc(db, 'users', userId));
        await deleteDoc(doc(db, 'admins', userId)).catch(() => {});
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }

    if (currentUser && currentUser.id === userId) {
      await logout();
    }

    return {
      success: true,
      authDeleted: authDeletedOnServer,
    };
  };

  const deleteMyAccount = async (password?: string): Promise<SelfDeleteAccountResult> => {
    const fbUser = auth.currentUser;
    if (!fbUser || !currentUser) {
      return { success: false, error: 'Aucun compte connecté.' };
    }

    if ((fbUser.email || '').toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL) {
      return {
        success: false,
        error: 'Le compte super-administrateur principal ne peut pas être auto-supprimé.',
      };
    }

    const hasPasswordProvider = fbUser.providerData.some((p) => p.providerId === 'password');
    const hasGoogleProvider = fbUser.providerData.some((p) => p.providerId === 'google.com');

    try {
      if (password && fbUser.email) {
        const cred = EmailAuthProvider.credential(fbUser.email, password);
        await reauthenticateWithCredential(fbUser, cred);
      } else if (!isRecentAuthSession(fbUser.metadata.lastSignInTime)) {
        if (hasGoogleProvider && !hasPasswordProvider) {
          await reauthenticateWithPopup(fbUser, new GoogleAuthProvider());
        } else {
          return {
            success: false,
            requiresRecentLogin: true,
            error:
              'Par sécurité, confirmez votre mot de passe actuel pour supprimer définitivement vos identifiants.',
          };
        }
      }

      // 1. Delete user's own notifications in Firestore (scoped to satisfy firestore.rules list rule)
      const notifSnap = await getDocs(
        query(
          collection(db, 'notifications'),
          where('recipientScope', '==', 'user'),
          where('userId', '==', fbUser.uid)
        )
      );
      await Promise.all(notifSnap.docs.map((d) => deleteDoc(d.ref)));

      // 2. Delete user profile document in Firestore
      await deleteDoc(doc(db, 'users', fbUser.uid));
      await deleteDoc(doc(db, 'admins', fbUser.uid)).catch(() => {});

      // 3. Permanently delete Firebase Auth user & credentials (email, password hash, tokens)
      await firebaseDeleteAuthUser(fbUser);
      setCurrentUser(null);
      setUsers([]);

      return { success: true };
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/requires-recent-login') {
        return {
          success: false,
          requiresRecentLogin: true,
          error:
            hasPasswordProvider
              ? 'Session trop ancienne : saisissez votre mot de passe actuel pour confirmer la suppression définitive.'
              : 'Session trop ancienne : veuillez vous reconnecter avec Google puis réessayer.',
        };
      }
      return {
        success: false,
        error: mapFirebaseAuthError(err),
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        authReady,
        isAuthenticated,
        isAdmin,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        login,
        register,
        resetPassword,
        logout,
        updateUserRole,
        updateUserStatus,
        updateProfile,
        deleteUser,
        deleteMyAccount,
        adminAuthDeletionReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
