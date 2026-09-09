import { ActivityLog, User } from "../models/index.js";
import type { ActivityType } from "@endlessbacklog/shared";

export const activityRepository = {
  record(data: { boardId: string; cardId?: string | null; actorId: string; type: ActivityType; metadata?: Record<string, unknown> }) {
    return ActivityLog.create({
      boardId: data.boardId,
      cardId: data.cardId ?? null,
      actorId: data.actorId,
      type: data.type,
      metadata: data.metadata ?? {},
    });
  },
  listForBoard(boardId: string, limit = 50) {
    return ActivityLog.findAll({
      where: { boardId },
      include: [{ model: User, as: "actor" }],
      order: [["createdAt", "DESC"]],
      limit,
    });
  },
  listForCard(cardId: string, limit = 50) {
    return ActivityLog.findAll({
      where: { cardId },
      include: [{ model: User, as: "actor" }],
      order: [["createdAt", "DESC"]],
      limit,
    });
  },
};
