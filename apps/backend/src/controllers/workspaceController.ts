import type { Request, Response } from "express";
import { workspaceService } from "../services/workspaceService.js";
import { AppError } from "../utils/AppError.js";
import { param } from "../utils/param.js";

export const workspaceController = {
  async create(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const workspace = await workspaceService.create(req.user.id, req.body);
    res.status(201).json({ workspace });
  },

  async listMine(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const workspaces = await workspaceService.listForUser(req.user.id);
    res.status(200).json({ workspaces });
  },

  async get(req: Request, res: Response) {
    const workspace = await workspaceService.get(param(req, "workspaceId"));
    res.status(200).json({ workspace, myRole: req.workspaceMembership!.role });
  },

  async update(req: Request, res: Response) {
    const workspace = await workspaceService.update(param(req, "workspaceId"), req.body);
    res.status(200).json({ workspace });
  },

  async listMembers(req: Request, res: Response) {
    const members = await workspaceService.listMembers(param(req, "workspaceId"));
    res.status(200).json({ members });
  },

  async invite(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await workspaceService.invite(param(req, "workspaceId"), req.user.email, req.body);
    res.status(204).send();
  },

  async acceptInvite(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const member = await workspaceService.acceptInvite(req.user.id, req.user.email, req.body.token);
    res.status(200).json({ member });
  },

  async updateMemberRole(req: Request, res: Response) {
    const member = await workspaceService.updateMemberRole(
      param(req, "workspaceId"),
      param(req, "memberId"),
      req.body.role,
    );
    res.status(200).json({ member });
  },

  async removeMember(req: Request, res: Response) {
    await workspaceService.removeMember(param(req, "workspaceId"), param(req, "memberId"));
    res.status(204).send();
  },
};
