import { Router } from "express";
import {
  createBoardSchema,
  updateBoardSchema,
  addBoardMemberSchema,
  updateBoardMemberRoleSchema,
} from "@endlessbacklog/shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspaceRole, requireBoardRole } from "../middleware/rbac.js";
import { boardController } from "../controllers/boardController.js";
import { listController } from "../controllers/listController.js";
import { cardController } from "../controllers/cardController.js";
import { labelController } from "../controllers/labelController.js";

export const boardRouter = Router();

boardRouter.use(requireAuth);

boardRouter.post(
  "/",
  requireWorkspaceRole("member", (req) => req.body.workspaceId),
  validate(createBoardSchema),
  boardController.create,
);

boardRouter.get("/:boardId", requireBoardRole("observer"), boardController.get);
boardRouter.patch("/:boardId", requireBoardRole("admin"), validate(updateBoardSchema), boardController.update);

boardRouter.get("/:boardId/members", requireBoardRole("observer"), boardController.listMembers);
boardRouter.get("/:boardId/activity", requireBoardRole("observer"), boardController.listActivity);
boardRouter.post(
  "/:boardId/members",
  requireBoardRole("admin"),
  validate(addBoardMemberSchema),
  boardController.addMember,
);
boardRouter.patch(
  "/:boardId/members/:userId",
  requireBoardRole("admin"),
  validate(updateBoardMemberRoleSchema),
  boardController.updateMember,
);
boardRouter.delete("/:boardId/members/:userId", requireBoardRole("admin"), boardController.removeMember);

boardRouter.get("/:boardId/lists", requireBoardRole("observer"), listController.listForBoard);
boardRouter.get("/:boardId/cards", requireBoardRole("observer"), cardController.listForBoard);
boardRouter.get("/:boardId/labels", requireBoardRole("observer"), labelController.listForBoard);
