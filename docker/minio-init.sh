#!/bin/sh
set -e

echo "Waiting for MinIO..."
until mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null 2>&1; do
  sleep 1
done

echo "Ensuring bucket '$MINIO_BUCKET' exists..."
mc mb --ignore-existing "local/$MINIO_BUCKET"

# Bucket stays private — the backend hands out short-lived presigned PUT/GET
# URLs for uploads and downloads (see src/services/storageService.ts), so no
# public bucket policy is needed.
echo "MinIO bucket ready."
