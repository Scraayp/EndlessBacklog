import type { Request } from "express";
import { AppError } from "./AppError.js";

/**
 * Express 5 types `req.params[name]` as `string | string[]` (to account for
 * routes with repeated params, e.g. `/files/*`). None of our routes use
 * that pattern, so this narrows to `string` and fails loudly if a route
 * param is ever missing — which would otherwise be a silent `undefined`
 * bug three layers down in a service call.
 */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") throw AppError.badRequest(`Missing path parameter: ${name}`);
  return value;
}
