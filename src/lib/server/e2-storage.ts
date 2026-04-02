import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { env } from '$lib/server/env';

let _s3: S3Client;
function getS3() {
  if (!_s3) _s3 = new S3Client({
    endpoint: env.E2_ENDPOINT,
    region: env.E2_REGION,
    credentials: {
      accessKeyId: env.E2_ACCESS_KEY_ID,
      secretAccessKey: env.E2_SECRET_ACCESS_KEY
    },
    forcePathStyle: true
  });
  return _s3;
}

export function getBackupKey(userId: string, timestamp: string): string {
  return `backups/${userId}/${timestamp}.json.gz`;
}

export async function uploadBackup(
  userId: string,
  data: Buffer,
  timestamp: string
): Promise<{ key: string; size: number }> {
  const key = getBackupKey(userId, timestamp);
  await getS3().send(
    new PutObjectCommand({ Bucket: env.E2_BUCKET, Key: key, Body: data, ContentType: 'application/gzip' })
  );
  return { key, size: data.byteLength };
}

export async function downloadBackup(key: string): Promise<Buffer> {
  const response = await getS3().send(
    new GetObjectCommand({ Bucket: env.E2_BUCKET, Key: key })
  );
  const stream = response.Body;
  if (!stream) throw new Error(`[e2] Empty response for key: ${key}`);
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function deleteBackup(key: string): Promise<void> {
  await getS3().send(
    new DeleteObjectCommand({ Bucket: env.E2_BUCKET, Key: key })
  );
}
