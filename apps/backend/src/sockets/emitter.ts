import { Emitter } from "@socket.io/redis-emitter";
import { createBullMQConnection } from "../config/redis.js";
import { userRoom, boardRoom, type SocketEventName } from "@endlessbacklog/shared";

/**
 * Lets processes without an HTTP server / Socket.io Server instance (the
 * BullMQ worker process) push events into the same Redis pub/sub channel
 * that the API process's Socket.io Server (see sockets/io.ts) is subscribed
 * to via @socket.io/redis-adapter. Used by job processors (notifications,
 * due-date reminders) that run in worker.ts, not server.ts.
 */
const emitter = new Emitter(createBullMQConnection());

export function emitToUserFromWorker(userId: string, event: SocketEventName, payload: unknown): void {
  emitter.to(userRoom(userId)).emit(event, payload);
}

export function emitToBoardFromWorker(boardId: string, event: SocketEventName, payload: unknown): void {
  emitter.to(boardRoom(boardId)).emit(event, payload);
}
