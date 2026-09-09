import { Router, type Request } from "express";
import { createCommentSchema, updateCommentSchema } from "@endlessbacklog/shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireBoardRole } from "../middleware/rbac.js";
import { commentController } from "../controllers/commentController.js";
import { commentRepository } from "../repositories/commentRepository.js";
import { AppError } from "../utils/AppError.js";
import { param } from "../utils/param.js";

export const commentRouter = Router();

commentRouter.use(requireAuth);

commentRouter.post(
  "/",
  requireBoardRole("member", (req) => commentRepository.getBoardIdForCard(req.body.cardId)),
  validate(createCommentSchema),
  commentController.create,
);

const boardIdForComment = async (req: Request) => {
  const cardId = await commentRepository.getCardIdForComment(param(req, "commentId"));
  if (!cardId) throw AppError.notFound("Comment not found");
  return commentRepository.getBoardIdForCard(cardId);
};

commentRouter.patch("/:commentId", requireBoardRole("member", boardIdForComment), validate(updateCommentSchema), commentController.update);
commentRouter.delete("/:commentId", requireBoardRole("member", boardIdForComment), commentController.remove);
