import type { Request, Response } from "express";
import { commentService } from "../services/commentService.js";
import { AppError } from "../utils/AppError.js";
import { hasBoardRoleAtLeast } from "@endlessbacklog/shared";
import { param } from "../utils/param.js";

export const commentController = {
  async create(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const comment = await commentService.create(req.body.cardId, req.user.id, req.body.bodyHtml, req.body.mentionedUserIds ?? []);
    res.status(201).json({ comment });
  },

  async update(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const comment = await commentService.update(param(req, "commentId"), req.user.id, req.body.bodyHtml, req.body.mentionedUserIds ?? []);
    res.status(200).json({ comment });
  },

  async remove(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const isBoardAdmin = req.boardEffectiveRole ? hasBoardRoleAtLeast(req.boardEffectiveRole, "admin") : false;
    await commentService.remove(param(req, "commentId"), req.user.id, isBoardAdmin);
    res.status(204).send();
  },
};
