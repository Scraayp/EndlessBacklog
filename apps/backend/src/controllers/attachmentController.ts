import type { Request, Response } from "express";
import { attachmentService } from "../services/attachmentService.js";
import { AppError } from "../utils/AppError.js";
import { param } from "../utils/param.js";

export const attachmentController = {
  async requestUpload(req: Request, res: Response) {
    const result = await attachmentService.requestUpload(req.body);
    res.status(200).json(result);
  },

  async confirmUpload(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const attachment = await attachmentService.confirmUpload(req.user.id, req.body);
    res.status(201).json({ attachment });
  },

  async remove(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await attachmentService.remove(req.user.id, param(req, "attachmentId"));
    res.status(204).send();
  },
};
