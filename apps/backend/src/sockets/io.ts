import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createBullMQConnection } from "../config/redis.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { boardRepository } from "../repositories/boardRepository.js";
import { workspaceRepository } from "../repositories/workspaceRepository.js";
import { boardRoom, userRoom, SOCKET_EVENTS, type SocketEventName } from "@endlessbacklog/shared";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

let io: Server | null = null;

export async function initSocketIO(httpServer: HttpServer): Promise<Server> {
  io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : env.FRONTEND_URL, credentials: true },
  });

  const pubClient = createBullMQConnection();
  const subClient = createBullMQConnection();
  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Missing auth token"));
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("Invalid or expired auth token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    void socket.join(userRoom(userId));
    logger.debug({ userId, socketId: socket.id }, "socket connected");

    socket.on(SOCKET_EVENTS.BOARD_JOIN, (boardId: string, ack?: (ok: boolean) => void) => {
      void handleBoardJoin(socket, boardId).then((ok) => ack?.(ok));
    });

    socket.on(SOCKET_EVENTS.BOARD_LEAVE, (boardId: string) => {
      void socket.leave(boardRoom(boardId));
      socket.to(boardRoom(boardId)).emit(SOCKET_EVENTS.PRESENCE_LEFT, { userId, boardId });
    });

    socket.on("disconnect", () => {
      logger.debug({ userId, socketId: socket.id }, "socket disconnected");
    });
  });

  return io;
}

async function handleBoardJoin(socket: Socket, boardId: string): Promise<boolean> {
  const userId = socket.data.userId as string;
  const board = await boardRepository.findById(boardId);
  if (!board) return false;

  const [workspaceMembership, boardMembership] = await Promise.all([
    workspaceRepository.getMembership(board.workspaceId, userId),
    boardRepository.getMembership(boardId, userId),
  ]);
  const hasAccess =
    Boolean(boardMembership) || (workspaceMembership && workspaceMembership.role !== "guest");
  if (!hasAccess) return false;

  await socket.join(boardRoom(boardId));
  socket.to(boardRoom(boardId)).emit(SOCKET_EVENTS.PRESENCE_JOINED, { userId, boardId });
  return true;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io has not been initialized yet");
  return io;
}

export function emitToBoard(boardId: string, event: SocketEventName, payload: unknown): void {
  getIO().to(boardRoom(boardId)).emit(event, payload);
}

export function emitToUser(userId: string, event: SocketEventName, payload: unknown): void {
  getIO().to(userRoom(userId)).emit(event, payload);
}
