import type { Request, Response } from "express";
import { labelService } from "../services/labelService.js";
import { param } from "../utils/param.js";

export const labelController = {
  async create(req: Request, res: Response) {
    const label = await labelService.create(req.body.boardId, req.body.name, req.body.color);
    res.status(201).json({ label });
  },

  async listForBoard(req: Request, res: Response) {
    const labels = await labelService.listForBoard(param(req, "boardId"));
    res.status(200).json({ labels });
  },

  async update(req: Request, res: Response) {
    const label = await labelService.update(param(req, "labelId"), req.body);
    res.status(200).json({ label });
  },

  async remove(req: Request, res: Response) {
    await labelService.remove(param(req, "labelId"));
    res.status(204).send();
  },
};
