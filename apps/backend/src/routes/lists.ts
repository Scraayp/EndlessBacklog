import { Router, type Request } from "express";
import { createListSchema, updateListSchema, reorderListSchema } from "@endlessbacklog/shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireBoardRole } from "../middleware/rbac.js";
import { listController } from "../controllers/listController.js";
import { listService } from "../services/listService.js";
import { param } from "../utils/param.js";

export const listRouter = Router();

listRouter.use(requireAuth);

listRouter.post(
  "/",
  requireBoardRole("member", (req) => req.body.boardId),
  validate(createListSchema),
  listController.create,
);

const boardIdForList = async (req: Request) => (await listService.get(param(req, "listId"))).boardId;

listRouter.patch(
  "/:listId",
  requireBoardRole("member", boardIdForList),
  validate(updateListSchema),
  listController.update,
);
listRouter.post(
  "/:listId/reorder",
  requireBoardRole("member", boardIdForList),
  validate(reorderListSchema),
  listController.reorder,
);
