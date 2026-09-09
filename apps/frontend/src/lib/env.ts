/** Backend API/WebSocket origin. Baked in at build time (Vite inlines
 *  `import.meta.env.VITE_*` into the bundle) — see docker/frontend.Dockerfile
 *  and docker-compose.yml build args. Defaults suit local `pnpm dev` against
 *  a backend on the default port. */
export const API_URL: string = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const SOCKET_URL: string = import.meta.env.VITE_SOCKET_URL || API_URL;
