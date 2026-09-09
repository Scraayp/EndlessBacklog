import { Router } from "express";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteWorkspaceMemberSchema,
  updateWorkspaceMemberRoleSchema,
  acceptInviteSchema,
} from "@endlessbacklog/shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/rbac.js";
import { workspaceController } from "../controllers/workspaceController.js";
import { boardController } from "../controllers/boardController.js";

export const workspaceRouter = Router();

workspaceRouter.use(requireAuth);

workspaceRouter.post("/", validate(createWorkspaceSchema), workspaceController.create);
workspaceRouter.get("/", workspaceController.listMine);
workspaceRouter.post("/accept-invite", validate(acceptInviteSchema), workspaceController.acceptInvite);

workspaceRouter.get("/:workspaceId", requireWorkspaceRole("guest"), workspaceController.get);
workspaceRouter.patch(
  "/:workspaceId",
  requireWorkspaceRole("admin"),
  validate(updateWorkspaceSchema),
  workspaceController.update,
);

workspaceRouter.get("/:workspaceId/boards", requireWorkspaceRole("guest"), boardController.listForWorkspace);

workspaceRouter.get("/:workspaceId/members", requireWorkspaceRole("guest"), workspaceController.listMembers);
workspaceRouter.post(
  "/:workspaceId/members/invite",
  requireWorkspaceRole("admin"),
  validate(inviteWorkspaceMemberSchema),
  workspaceController.invite,
);
workspaceRouter.patch(
  "/:workspaceId/members/:memberId",
  requireWorkspaceRole("admin"),
  validate(updateWorkspaceMemberRoleSchema),
  workspaceController.updateMemberRole,
);
workspaceRouter.delete(
  "/:workspaceId/members/:memberId",
  requireWorkspaceRole("admin"),
  workspaceController.removeMember,
);
