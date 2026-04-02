import { describe, it, expect, vi } from 'vitest';

vi.mock('@aws-sdk/client-s3', () => {
  const mockSend = vi.fn().mockResolvedValue({});
  return {
    S3Client: vi.fn().mockImplementation(() => ({ send: mockSend })),
    PutObjectCommand: vi.fn().mockImplementation((params) => params),
    GetObjectCommand: vi.fn().mockImplementation((params) => params),
    DeleteObjectCommand: vi.fn().mockImplementation((params) => params)
  };
});

vi.mock('$lib/server/env', () => ({
  env: {
    E2_ENDPOINT: 'https://e2.example.com',
    E2_REGION: 'us-east-1',
    E2_ACCESS_KEY_ID: 'test-key-id',
    E2_SECRET_ACCESS_KEY: 'test-secret',
    E2_BUCKET: 'test-bucket'
  }
}));

import { getBackupKey } from '$lib/server/e2-storage';

describe('e2-storage', () => {
  it('generates correct backup key', () => {
    const key = getBackupKey('user-123', '2026-04-02T00:00:00Z');
    expect(key).toBe('backups/user-123/2026-04-02T00:00:00Z.json.gz');
  });
});
