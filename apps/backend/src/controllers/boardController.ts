import type { Request, Response } from "express";
import { boardService } from "../services/boardService.js";
import { AppError } from "../utils/AppError.js";
import { param } from "../utils/param.js";

export const boardController = {
  async create(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const board = await boardService.create(req.user.id, req.body);
    res.status(201).json({ board });
  },

  async listForWorkspace(req: Request, res: Response) {
    const boards = await boardService.listForWorkspace(param(req, "workspaceId"));
    res.status(200).json({ boards });
  },

  async get(req: Request, res: Response) {
    res.status(200).json({ board: req.board, myRole: req.boardEffectiveRole });
  },

  async update(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const board = await boardService.update(param(req, "boardId"), req.user.id, req.body);
    res.status(200).json({ board });
  },

  async listMembers(req: Request, res: Response) {
    const members = await boardService.listMembers(param(req, "boardId"));
    res.status(200).json({ members });
  },

  async listActivity(req: Request, res: Response) {
    const activity = await boardService.listActivity(param(req, "boardId"));
    res.status(200).json({ activity });
  },

  async addMember(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const member = await boardService.addMember(param(req, "boardId"), req.user.id, req.body.userId, req.body.role);
    res.status(201).json({ member });
  },

  async updateMember(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const member = await boardService.updateMemberRole(param(req, "boardId"), req.user.id, param(req, "userId"), req.body.role);
    res.status(200).json({ member });
  },

  async removeMember(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await boardService.removeMember(param(req, "boardId"), req.user.id, param(req, "userId"));
    res.status(204).send();
  },
};
