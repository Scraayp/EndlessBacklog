import { Worker } from "bullmq";
import { createBullMQConnection } from "./config/redis.js";
import { connectDatabase } from "./config/database.js";
import { logger } from "./config/logger.js";
import { processEmailJob } from "./jobs/processors/emailProcessor.js";
import { processNotificationJob } from "./jobs/processors/notificationProcessor.js";
import { processDueDateScanJob } from "./jobs/processors/dueDateProcessor.js";
import { processDigestJob } from "./jobs/processors/digestProcessor.js";
import "./models/index.js";

async function main(): Promise<void> {
  await connectDatabase();

  const connection = createBullMQConnection();

  const workers = [
    new Worker("email", processEmailJob, { connection, concurrency: 5 }),
    new Worker("notification", processNotificationJob, { connection, concurrency: 10 }),
    new Worker("due-date-scan", processDueDateScanJob, { connection, concurrency: 1 }),
    new Worker("digest", processDigestJob, { connection, concurrency: 1 }),
  ];

  for (const worker of workers) {
    worker.on("failed", (job, err) => logger.error({ err, jobId: job?.id, queue: worker.name }, "job failed"));
    worker.on("completed", (job) => logger.debug({ jobId: job.id, queue: worker.name }, "job completed"));
  }

  logger.info("EndlessBacklog worker process started");

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "worker shutting down");
    await Promise.all(workers.map((w) => w.close()));
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  logger.error({ err }, "fatal worker startup error");
  process.exit(1);
});
