import { Queue } from "bullmq";
import { createBullMQConnection } from "../config/redis.js";

const connection = createBullMQConnection();

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  payload: Record<string, unknown>;
}

/** Repeatable jobs — no per-run payload needed. */
export type DueDateScanJobData = Record<string, never>;
export type DigestJobData = Record<string, never>;

export const emailQueue = new Queue<EmailJobData>("email", { connection });
export const notificationQueue = new Queue<NotificationJobData>("notification", { connection });
export const dueDateQueue = new Queue<DueDateScanJobData>("due-date-scan", { connection });
export const digestQueue = new Queue<DigestJobData>("digest", { connection });

export async function scheduleRepeatableJobs(): Promise<void> {
  await dueDateQueue.add(
    "scan",
    {},
    { repeat: { every: 15 * 60 * 1000 }, jobId: "due-date-scan-repeat" },
  );
  await digestQueue.add(
    "daily-digest",
    {},
    { repeat: { pattern: "0 8 * * *" }, jobId: "daily-digest-repeat" },
  );
}
