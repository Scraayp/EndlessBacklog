import { Notification } from "../models/index.js";
import type { NotificationType } from "@endlessbacklog/shared";

export const notificationRepository = {
  create(data: { userId: string; type: NotificationType; payload: Record<string, unknown> }) {
    return Notification.create(data);
  },
  listForUser(userId: string, limit = 50) {
    return Notification.findAll({ where: { userId }, order: [["createdAt", "DESC"]], limit });
  },
  countUnread(userId: string) {
    return Notification.count({ where: { userId, isRead: false } });
  },
  async markRead(userId: string, id: string) {
    const [count] = await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { id, userId } },
    );
    return count > 0;
  },
  markAllRead(userId: string) {
    return Notification.update({ isRead: true, readAt: new Date() }, { where: { userId, isRead: false } });
  },

  async usersWithUnreadCounts(): Promise<Array<{ userId: string; count: number }>> {
    const rows = await Notification.findAll({
      attributes: ["userId", [Notification.sequelize!.fn("COUNT", Notification.sequelize!.col("id")), "count"]],
      where: { isRead: false },
      group: ["user_id"],
      raw: true,
    });
    return (rows as unknown as Array<{ userId: string; count: string }>).map((r) => ({
      userId: r.userId,
      count: Number(r.count),
    }));
  },
};
