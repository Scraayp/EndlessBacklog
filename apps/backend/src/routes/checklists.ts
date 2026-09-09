import { Router, type Request } from "express";
import {
  createChecklistSchema,
  updateChecklistSchema,
  createChecklistItemSchema,
  updateChecklistItemSchema,
} from "@endlessbacklog/shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireBoardRole } from "../middleware/rbac.js";
import { checklistController } from "../controllers/checklistController.js";
import { checklistRepository } from "../repositories/checklistRepository.js";
import { AppError } from "../utils/AppError.js";
import { param } from "../utils/param.js";

export const checklistRouter = Router();

checklistRouter.use(requireAuth);

async function boardIdForCard(cardId: string | undefined): Promise<string | undefined> {
  if (!cardId) return undefined;
  return checklistRepository.getBoardIdForCard(cardId);
}

checklistRouter.post(
  "/",
  requireBoardRole("member", (req) => boardIdForCard(req.body.cardId)),
  validate(createChecklistSchema),
  checklistController.create,
);

const boardIdForChecklist = async (req: Request) => {
  const cardId = await checklistRepository.getCardIdForChecklist(param(req, "checklistId"));
  if (!cardId) throw AppError.notFound("Checklist not found");
  return boardIdForCard(cardId);
};

checklistRouter.patch("/:checklistId", requireBoardRole("member", boardIdForChecklist), validate(updateChecklistSchema), checklistController.update);
checklistRouter.delete("/:checklistId", requireBoardRole("member", boardIdForChecklist), checklistController.remove);

checklistRouter.post(
  "/items",
  requireBoardRole("member", async (req) => {
    const cardId = await checklistRepository.getCardIdForChecklist(req.body.checklistId);
    return boardIdForCard(cardId);
  }),
  validate(createChecklistItemSchema),
  checklistController.addItem,
);

const boardIdForItem = async (req: Request) => {
  const cardId = await checklistRepository.getCardIdForItem(param(req, "itemId"));
  if (!cardId) throw AppError.notFound("Checklist item not found");
  return boardIdForCard(cardId);
};

checklistRouter.patch("/items/:itemId", requireBoardRole("member", boardIdForItem), validate(updateChecklistItemSchema), checklistController.updateItem);
checklistRouter.delete("/items/:itemId", requireBoardRole("member", boardIdForItem), checklistController.removeItem);
