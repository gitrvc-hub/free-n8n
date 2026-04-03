import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config.js';

const s3 = new S3Client({
	endpoint: config.E2_ENDPOINT,
	region: config.E2_REGION,
	credentials: {
		accessKeyId: config.E2_ACCESS_KEY_ID,
		secretAccessKey: config.E2_SECRET_ACCESS_KEY
	},
	forcePathStyle: true
});

export async function uploadBackup(
	userId: string,
	data: Buffer,
	timestamp: string
): Promise<{ key: string; size: number }> {
	const key = `backups/${userId}/${timestamp}.json.gz`;
	await s3.send(
		new PutObjectCommand({
			Bucket: config.E2_BUCKET,
			Key: key,
			Body: data,
			ContentType: 'application/gzip'
		})
	);
	return { key, size: data.byteLength };
}
