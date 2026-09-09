import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Dummy values for every required env var (see config/env.ts's zod
    // schema) so importing app modules doesn't require a real .env file on
    // a fresh checkout or in CI. Applied to process.env before any test or
    // setup file loads (unlike setupFiles, which can race module-level
    // env.ts validation across files sharing a worker).
    env: {
      NODE_ENV: "test",
      BASE_URL: "http://localhost:4000",
      FRONTEND_URL: "http://localhost:3000",
      DB_DIALECT: "postgres",
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      REDIS_URL: "redis://localhost:6379",
      S3_ENDPOINT: "http://localhost:9000",
      S3_BUCKET: "test-bucket",
      S3_ACCESS_KEY: "test",
      S3_SECRET_KEY: "test",
      SMTP_HOST: "localhost",
      SMTP_PORT: "1025",
      SMTP_USER: "test",
      SMTP_PASS: "test",
      MAIL_FROM: "test@example.com",
      JWT_ACCESS_SECRET: "test-only-access-secret-32-characters-min",
      JWT_REFRESH_SECRET: "test-only-refresh-secret-32-characters-min",
      TOTP_ENCRYPTION_KEY: "test-only-totp-key-32-characters-minimum",
    },
  },
});
