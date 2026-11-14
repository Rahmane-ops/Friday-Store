import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDeletedUserTombstone,
  isRecentAuthSession,
  isValidTargetUserId,
  parseServiceAccountJson,
} from './userDeletion';

test('isValidTargetUserId enforces strict Firebase ID format', () => {
  assert.equal(isValidTargetUserId('abcDEF_123-xyz'), true);
  assert.equal(isValidTargetUserId(''), false);
  assert.equal(isValidTargetUserId('../admins/abc'), false);
  assert.equal(isValidTargetUserId('a'.repeat(129)), false);
});

test('buildDeletedUserTombstone builds zero-PII revocation record', () => {
  const tombstone = buildDeletedUserTombstone({
    userId: 'uid-999',
    deletedBy: 'admin-1',
    authDeleted: true,
    deletedAt: '2026-11-14T15:00:00.000Z',
  });
  assert.deepEqual(tombstone, {
    id: 'uid-999',
    deletedAt: '2026-11-14T15:00:00.000Z',
    deletedBy: 'admin-1',
    authDeleted: true,
  });
  assert.equal('email' in tombstone, false);
  assert.equal('phone' in tombstone, false);
});

test('isRecentAuthSession validates whether Firebase Auth session is recent enough for self-deletion', () => {
  const now = Date.parse('2026-11-14T15:10:00.000Z');
  assert.equal(isRecentAuthSession('2026-11-14T15:08:00.000Z', 4 * 60 * 1000, now), true);
  assert.equal(isRecentAuthSession('2026-11-14T15:00:00.000Z', 4 * 60 * 1000, now), false);
  assert.equal(isRecentAuthSession(null, 4 * 60 * 1000, now), false);
});

test('parseServiceAccountJson parses raw and base64-encoded service accounts and rejects invalid input', () => {
  const raw = JSON.stringify({
    project_id: 'avid-sunrise-mmvz5',
    client_email: 'firebase@avid-sunrise-mmvz5.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----',
  });
  const parsedRaw = parseServiceAccountJson(raw);
  assert.equal(parsedRaw?.project_id, 'avid-sunrise-mmvz5');
  assert.equal(parsedRaw?.private_key.includes('\n'), true);

  const b64 = Buffer.from(raw, 'utf-8').toString('base64');
  const parsedB64 = parseServiceAccountJson(b64);
  assert.equal(parsedB64?.client_email, 'firebase@avid-sunrise-mmvz5.iam.gserviceaccount.com');

  assert.equal(parseServiceAccountJson('not-json'), null);
  assert.equal(parseServiceAccountJson(''), null);
});
