import type { Request, Response } from "express";
import { cardService } from "../services/cardService.js";
import { AppError } from "../utils/AppError.js";
import { param } from "../utils/param.js";

export const cardController = {
  async create(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const card = await cardService.create(req.body.listId, req.user.id, req.body.title);
    res.status(201).json({ card });
  },

  async listForBoard(req: Request, res: Response) {
    const cards = await cardService.listForBoard(param(req, "boardId"));
    res.status(200).json({ cards });
  },

  async getDetail(req: Request, res: Response) {
    const card = await cardService.getDetail(param(req, "cardId"));
    res.status(200).json({ card });
  },

  async update(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const card = await cardService.update(param(req, "cardId"), req.user.id, req.body);
    res.status(200).json({ card });
  },

  async move(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const card = await cardService.move(param(req, "cardId"), req.user.id, req.body.listId, req.body.beforeId, req.body.afterId);
    res.status(200).json({ card });
  },

  async addLabel(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await cardService.addLabel(param(req, "cardId"), req.user.id, req.body.labelId);
    res.status(204).send();
  },

  async removeLabel(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await cardService.removeLabel(param(req, "cardId"), req.user.id, param(req, "labelId"));
    res.status(204).send();
  },

  async addMember(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await cardService.addMember(param(req, "cardId"), req.user.id, req.body.userId);
    res.status(204).send();
  },

  async removeMember(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await cardService.removeMember(param(req, "cardId"), req.user.id, param(req, "userId"));
    res.status(204).send();
  },

  async listActivity(req: Request, res: Response) {
    const activity = await cardService.listActivity(param(req, "cardId"));
    res.status(200).json({ activity });
  },
};
