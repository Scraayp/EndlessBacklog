import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase } from "./config/database.js";
import { initSocketIO } from "./sockets/io.js";
import { scheduleRepeatableJobs } from "./jobs/queues.js";
import "./models/index.js"; // ensure all model associations are registered before use

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const httpServer = createServer(app);

  await initSocketIO(httpServer);
  await scheduleRepeatableJobs();

  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT, dialect: env.DB_DIALECT }, "EndlessBacklog API listening");
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, "shutting down");
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.error({ err }, "fatal startup error");
  process.exit(1);
});
