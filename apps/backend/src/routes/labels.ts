import { Router, type Request } from "express";
import { createLabelSchema, updateLabelSchema } from "@endlessbacklog/shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireBoardRole } from "../middleware/rbac.js";
import { labelController } from "../controllers/labelController.js";
import { labelService } from "../services/labelService.js";
import { param } from "../utils/param.js";

export const labelRouter = Router();

labelRouter.use(requireAuth);

labelRouter.post(
  "/",
  requireBoardRole("member", (req) => req.body.boardId),
  validate(createLabelSchema),
  labelController.create,
);

const boardIdForLabel = async (req: Request) => (await labelService.get(param(req, "labelId"))).boardId;

labelRouter.patch("/:labelId", requireBoardRole("member", boardIdForLabel), validate(updateLabelSchema), labelController.update);
labelRouter.delete("/:labelId", requireBoardRole("member", boardIdForLabel), labelController.remove);
