import { Router, type Request } from "express";
import { requestAttachmentUploadSchema, confirmAttachmentUploadSchema } from "@endlessbacklog/shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireBoardRole } from "../middleware/rbac.js";
import { attachmentController } from "../controllers/attachmentController.js";
import { attachmentRepository } from "../repositories/attachmentRepository.js";
import { AppError } from "../utils/AppError.js";
import { param } from "../utils/param.js";

export const attachmentRouter = Router();

attachmentRouter.use(requireAuth);

attachmentRouter.post(
  "/request-upload",
  requireBoardRole("member", (req) => attachmentRepository.getBoardIdForCard(req.body.cardId)),
  validate(requestAttachmentUploadSchema),
  attachmentController.requestUpload,
);

attachmentRouter.post(
  "/confirm-upload",
  requireBoardRole("member", (req) => attachmentRepository.getBoardIdForCard(req.body.cardId)),
  validate(confirmAttachmentUploadSchema),
  attachmentController.confirmUpload,
);

const boardIdForAttachment = async (req: Request) => {
  const attachment = await attachmentRepository.findById(param(req, "attachmentId"));
  if (!attachment) throw AppError.notFound("Attachment not found");
  return attachmentRepository.getBoardIdForCard(attachment.cardId);
};

attachmentRouter.delete("/:attachmentId", requireBoardRole("member", boardIdForAttachment), attachmentController.remove);
