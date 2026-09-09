import { notificationRepository } from "../repositories/notificationRepository.js";
import { notificationQueue } from "../jobs/queues.js";
import type { NotificationType } from "@endlessbacklog/shared";

export const notificationService = {
  /** Fire-and-forget: enqueues creation + the `notification:new` socket push,
   *  decoupled from whatever request triggered it (comment mention, card
   *  assignment, etc). See jobs/processors/notificationProcessor.ts. */
  async notify(userId: string, type: NotificationType, payload: Record<string, unknown>): Promise<void> {
    await notificationQueue.add("notify", { userId, type, payload });
  },

  async notifyMany(userIds: string[], type: NotificationType, payload: Record<string, unknown>): Promise<void> {
    await Promise.all(userIds.map((userId) => notificationService.notify(userId, type, payload)));
  },

  list(userId: string) {
    return notificationRepository.listForUser(userId);
  },

  countUnread(userId: string) {
    return notificationRepository.countUnread(userId);
  },

  async markRead(userId: string, id: string) {
    const ok = await notificationRepository.markRead(userId, id);
    return ok;
  },

  markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  },
};
