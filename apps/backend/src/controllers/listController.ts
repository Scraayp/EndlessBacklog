import type { Request, Response } from "express";
import { listService } from "../services/listService.js";
import { AppError } from "../utils/AppError.js";
import { param } from "../utils/param.js";

export const listController = {
  async create(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const list = await listService.create(req.body.boardId, req.user.id, req.body.name);
    res.status(201).json({ list });
  },

  async listForBoard(req: Request, res: Response) {
    const lists = await listService.listForBoard(param(req, "boardId"));
    res.status(200).json({ lists });
  },

  async update(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const list = await listService.update(param(req, "listId"), req.user.id, req.body);
    res.status(200).json({ list });
  },

  async reorder(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const list = await listService.reorder(param(req, "listId"), req.user.id, req.body.beforeId, req.body.afterId);
    res.status(200).json({ list });
  },
};
