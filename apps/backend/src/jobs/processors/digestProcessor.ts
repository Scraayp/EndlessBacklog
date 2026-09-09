import { notificationRepository } from "../../repositories/notificationRepository.js";
import { userRepository } from "../../repositories/userRepository.js";
import { emailQueue } from "../queues.js";
import { digestTemplate } from "../emailTemplates.js";
import { logger } from "../../config/logger.js";

/** Repeatable job (daily, 08:00): emails every user with unread notifications
 *  a one-line digest, so nothing gets missed if they're not actively watching
 *  the in-app bell. (No per-user opt-out yet — see wiki/Roadmap.md.) */
export async function processDigestJob(): Promise<void> {
  const rows = await notificationRepository.usersWithUnreadCounts();
  if (rows.length === 0) return;

  const users = await userRepository.findByIds(rows.map((r) => r.userId));
  const userById = new Map(users.map((u) => [u.id, u]));

  for (const row of rows) {
    const user = userById.get(row.userId);
    if (!user) continue;
    const { subject, html } = digestTemplate({ unreadCount: row.count });
    await emailQueue.add("digest", { to: user.email, subject, html });
  }

  logger.info({ recipients: rows.length }, "digest emails queued");
}
