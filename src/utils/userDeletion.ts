export const BOOTSTRAPPED_ADMIN_EMAIL = 'abdourahmanebathily1@gmail.com';
export const VALID_FIREBASE_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

export interface DeletedUserTombstone {
  id: string;
  deletedAt: string;
  deletedBy: string;
  authDeleted: boolean;
}

export interface AdminDeleteUserResult {
  success: boolean;
  authDeleted: boolean;
  error?: string;
}

export interface SelfDeleteAccountResult {
  success: boolean;
  requiresRecentLogin?: boolean;
  error?: string;
}

export function isValidTargetUserId(userId: string): boolean {
  return VALID_FIREBASE_ID_REGEX.test(userId);
}

export function buildDeletedUserTombstone(params: {
  userId: string;
  deletedBy: string;
  authDeleted: boolean;
  deletedAt?: string;
}): DeletedUserTombstone {
  return {
    id: params.userId,
    deletedAt: params.deletedAt || new Date().toISOString(),
    deletedBy: params.deletedBy,
    authDeleted: Boolean(params.authDeleted),
  };
}

export function isRecentAuthSession(lastSignInTime?: string | null, maxAgeMs = 4 * 60 * 1000, nowMs = Date.now()): boolean {
  if (!lastSignInTime) return false;
  const parsed = Date.parse(lastSignInTime);
  if (Number.isNaN(parsed)) return false;
  return nowMs - parsed <= maxAgeMs;
}

export interface ParsedServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

export function parseServiceAccountJson(raw?: string | null): ParsedServiceAccount | null {
  if (!raw || !raw.trim()) return null;
  let candidate = raw.trim();
  if (!candidate.startsWith('{')) {
    try {
      candidate = Buffer.from(candidate, 'base64').toString('utf-8').trim();
    } catch {
      return null;
    }
  }
  try {
    const parsed = JSON.parse(candidate) as Partial<ParsedServiceAccount>;
    if (
      typeof parsed.project_id === 'string' &&
      parsed.project_id.length > 0 &&
      typeof parsed.client_email === 'string' &&
      parsed.client_email.length > 0 &&
      typeof parsed.private_key === 'string' &&
      parsed.private_key.includes('BEGIN')
    ) {
      return {
        project_id: parsed.project_id,
        client_email: parsed.client_email,
        private_key: parsed.private_key.replace(/\\n/g, '\n'),
      };
    }
    return null;
  } catch {
    return null;
  }
}
