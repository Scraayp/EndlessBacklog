import type { Request, Response } from "express";
import { notificationService } from "../services/notificationService.js";
import { AppError } from "../utils/AppError.js";
import { param } from "../utils/param.js";

export const notificationController = {
  async list(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const [notifications, unreadCount] = await Promise.all([
      notificationService.list(req.user.id),
      notificationService.countUnread(req.user.id),
    ]);
    res.status(200).json({ notifications, unreadCount });
  },

  async markRead(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const ok = await notificationService.markRead(req.user.id, param(req, "id"));
    if (!ok) throw AppError.notFound("Notification not found");
    res.status(204).send();
  },

  async markAllRead(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await notificationService.markAllRead(req.user.id);
    res.status(204).send();
  },
};
