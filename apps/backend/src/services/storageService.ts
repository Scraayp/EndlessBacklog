import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { s3, ATTACHMENTS_BUCKET } from "../config/s3.js";

const UPLOAD_URL_TTL_SECONDS = 300;
const DOWNLOAD_URL_TTL_SECONDS = 3600;

export const storageService = {
  buildObjectKey(cardId: string, fileName: string): string {
    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    return `cards/${cardId}/${randomUUID()}-${safeName}`;
  },

  /** Presigned PUT URL — the frontend uploads directly to MinIO/S3, the API
   *  never proxies file bytes. */
  async getUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({ Bucket: ATTACHMENTS_BUCKET, Key: key, ContentType: contentType });
    return getSignedUrl(s3, command, { expiresIn: UPLOAD_URL_TTL_SECONDS });
  },

  async getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: ATTACHMENTS_BUCKET, Key: key });
    return getSignedUrl(s3, command, { expiresIn: DOWNLOAD_URL_TTL_SECONDS });
  },

  async deleteObject(key: string): Promise<void> {
    await s3.send(new DeleteObjectCommand({ Bucket: ATTACHMENTS_BUCKET, Key: key }));
  },
};
