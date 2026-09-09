import { Router, type Request } from "express";
import {
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
  cardLabelSchema,
  cardMemberSchema,
} from "@endlessbacklog/shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireBoardRole } from "../middleware/rbac.js";
import { cardController } from "../controllers/cardController.js";
import { cardService } from "../services/cardService.js";
import { listService } from "../services/listService.js";
import { param } from "../utils/param.js";

export const cardRouter = Router();

cardRouter.use(requireAuth);

cardRouter.post(
  "/",
  requireBoardRole("member", async (req) => (await listService.get(req.body.listId)).boardId),
  validate(createCardSchema),
  cardController.create,
);

const boardIdForCard = async (req: Request) => cardService.getBoardIdForCard(param(req, "cardId"));

cardRouter.get("/:cardId", requireBoardRole("observer", boardIdForCard), cardController.getDetail);
cardRouter.patch("/:cardId", requireBoardRole("member", boardIdForCard), validate(updateCardSchema), cardController.update);
cardRouter.post("/:cardId/move", requireBoardRole("member", boardIdForCard), validate(moveCardSchema), cardController.move);

cardRouter.post("/:cardId/labels", requireBoardRole("member", boardIdForCard), validate(cardLabelSchema), cardController.addLabel);
cardRouter.delete("/:cardId/labels/:labelId", requireBoardRole("member", boardIdForCard), cardController.removeLabel);

cardRouter.post("/:cardId/members", requireBoardRole("member", boardIdForCard), validate(cardMemberSchema), cardController.addMember);
cardRouter.delete("/:cardId/members/:userId", requireBoardRole("member", boardIdForCard), cardController.removeMember);

cardRouter.get("/:cardId/activity", requireBoardRole("observer", boardIdForCard), cardController.listActivity);
