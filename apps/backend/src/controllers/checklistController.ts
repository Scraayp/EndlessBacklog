import type { Request, Response } from "express";
import { checklistService } from "../services/checklistService.js";
import { AppError } from "../utils/AppError.js";
import { param } from "../utils/param.js";

export const checklistController = {
  async create(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const checklist = await checklistService.create(req.body.cardId, req.user.id, req.body.title);
    res.status(201).json({ checklist });
  },

  async update(req: Request, res: Response) {
    const checklist = await checklistService.update(param(req, "checklistId"), req.body);
    res.status(200).json({ checklist });
  },

  async remove(req: Request, res: Response) {
    await checklistService.remove(param(req, "checklistId"));
    res.status(204).send();
  },

  async addItem(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const item = await checklistService.addItem(
      req.body.checklistId,
      req.user.id,
      req.body.text,
      req.body.dueDate,
      req.body.assigneeId,
    );
    res.status(201).json({ item });
  },

  async updateItem(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const item = await checklistService.updateItem(param(req, "itemId"), req.user.id, req.body);
    res.status(200).json({ item });
  },

  async removeItem(req: Request, res: Response) {
    await checklistService.removeItem(param(req, "itemId"));
    res.status(204).send();
  },
};
