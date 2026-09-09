import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "./env.js";
import { useAuthStore } from "../stores/authStore.js";

let socket: Socket | null = null;

/** Singleton Socket.io connection, authenticated with the current access
 *  token on every (re)connect attempt — `auth` as a function is re-evaluated
 *  by socket.io-client each time, so a token refreshed after a disconnect is
 *  picked up automatically on reconnection. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) s.connect();
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
