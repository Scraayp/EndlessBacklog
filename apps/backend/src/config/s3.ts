import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

/** MinIO speaks the S3 API, so a real AWS S3 bucket is a drop-in swap later
 *  by changing S3_ENDPOINT/credentials only. */
export const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

export const ATTACHMENTS_BUCKET = env.S3_BUCKET;
