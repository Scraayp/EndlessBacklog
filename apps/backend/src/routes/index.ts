import { Router } from "express";
import { authRouter } from "./auth.js";
import { oauthRouter } from "./oauth.js";
import { workspaceRouter } from "./workspaces.js";
import { boardRouter } from "./boards.js";
import { listRouter } from "./lists.js";
import { labelRouter } from "./labels.js";
import { cardRouter } from "./cards.js";
import { checklistRouter } from "./checklists.js";
import { commentRouter } from "./comments.js";
import { attachmentRouter } from "./attachments.js";
import { notificationRouter } from "./notifications.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

apiRouter.use("/auth/oauth", oauthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/workspaces", workspaceRouter);
apiRouter.use("/boards", boardRouter);
apiRouter.use("/lists", listRouter);
apiRouter.use("/labels", labelRouter);
apiRouter.use("/cards", cardRouter);
apiRouter.use("/checklists", checklistRouter);
apiRouter.use("/comments", commentRouter);
apiRouter.use("/attachments", attachmentRouter);
apiRouter.use("/notifications", notificationRouter);
