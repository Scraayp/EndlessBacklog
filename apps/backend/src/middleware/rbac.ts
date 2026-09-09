import type { NextFunction, Request, Response } from "express";
import { workspaceRepository } from "../repositories/workspaceRepository.js";
import { boardRepository } from "../repositories/boardRepository.js";
import { AppError } from "../utils/AppError.js";
import {
  hasWorkspaceRoleAtLeast,
  hasBoardRoleAtLeast,
  type WorkspaceRole,
  type BoardRole,
} from "@endlessbacklog/shared";

type IdResolver = (req: Request) => string | undefined | Promise<string | undefined>;

const paramId = (name: string): IdResolver => (req) => {
  const value = req.params[name];
  return typeof value === "string" ? value : undefined;
};

/** Requires the authenticated user to be an active member of the workspace
 *  (resolved from req.params.workspaceId by default) with at least `minRole`. */
export function requireWorkspaceRole(minRole: WorkspaceRole, resolve: IdResolver = paramId("workspaceId")) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) return next(AppError.unauthorized());
    const workspaceId = await resolve(req);
    if (!workspaceId) return next(AppError.badRequest("Missing workspaceId"));

    const membership = await workspaceRepository.getMembership(workspaceId, req.user.id);
    if (!membership) return next(AppError.forbidden("You are not a member of this workspace"));
    if (!hasWorkspaceRoleAtLeast(membership.role, minRole)) {
      return next(AppError.forbidden(`Requires ${minRole} role on this workspace`));
    }
    req.workspaceMembership = membership;
    next();
  };
}

/**
 * Requires effective board access at least `minRole`. Effective role is the
 * higher of: an explicit BoardMember row, or the role implied by workspace
 * membership (workspace admin => board admin, workspace member => board
 * member). Workspace guests get no implicit board access — they must have an
 * explicit BoardMember row, matching Trello's "guest" semantics.
 */
export function requireBoardRole(minRole: BoardRole, resolve: IdResolver = paramId("boardId")) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) return next(AppError.unauthorized());
    const boardId = await resolve(req);
    if (!boardId) return next(AppError.badRequest("Missing boardId"));

    const board = await boardRepository.findById(boardId);
    if (!board) return next(AppError.notFound("Board not found"));

    const [workspaceMembership, boardMembership] = await Promise.all([
      workspaceRepository.getMembership(board.workspaceId, req.user.id),
      boardRepository.getMembership(boardId, req.user.id),
    ]);

    let effectiveRole: BoardRole | null = boardMembership?.role ?? null;
    if (workspaceMembership && workspaceMembership.role !== "guest") {
      const implied: BoardRole = workspaceMembership.role === "admin" ? "admin" : "member";
      if (!effectiveRole || hasBoardRoleAtLeast(implied, effectiveRole)) effectiveRole = implied;
    }

    if (!effectiveRole || !hasBoardRoleAtLeast(effectiveRole, minRole)) {
      return next(AppError.forbidden("You do not have access to this board"));
    }

    req.board = board;
    req.boardEffectiveRole = effectiveRole;
    next();
  };
}
