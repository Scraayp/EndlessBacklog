import type { Job } from "bullmq";
import { sendMail } from "../../config/mailer.js";
import { logger } from "../../config/logger.js";
import type { EmailJobData } from "../queues.js";

export async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  await sendMail(job.data);
  logger.info({ to: job.data.to, subject: job.data.subject }, "email sent");
}
