import type { Job } from "bullmq";
import { notificationRepository } from "../../repositories/notificationRepository.js";
import { emitToUserFromWorker } from "../../sockets/emitter.js";
import { SOCKET_EVENTS } from "@endlessbacklog/shared";
import type { NotificationJobData } from "../queues.js";
import type { NotificationType } from "@endlessbacklog/shared";

export async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { userId, type, payload } = job.data;
  const notification = await notificationRepository.create({
    userId,
    type: type as NotificationType,
    payload,
  });
  emitToUserFromWorker(userId, SOCKET_EVENTS.NOTIFICATION_NEW, { notification });
}
