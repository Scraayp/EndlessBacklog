import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { notificationController } from "../controllers/notificationController.js";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get("/", notificationController.list);
notificationRouter.post("/:id/read", notificationController.markRead);
notificationRouter.post("/read-all", notificationController.markAllRead);
