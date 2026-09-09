import { z } from "zod";
import { BOARD_ROLES } from "../constants/roles.js";
import { hexColorSchema, uuidSchema } from "./common.js";

export const createBoardSchema = z
  .object({
    workspaceId: uuidSchema,
    name: z.string().trim().min(1).max(100),
    backgroundType: z.enum(["color", "image"]).optional(),
    backgroundValue: z.string().min(1).optional(),
  })
  .refine(
    (data) => data.backgroundType !== "color" || !data.backgroundValue || hexColorSchema.safeParse(data.backgroundValue).success,
    { message: "backgroundValue must be a hex color when backgroundType is 'color'", path: ["backgroundValue"] },
  );

export const updateBoardSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  backgroundType: z.enum(["color", "image"]).optional(),
  backgroundValue: z.string().min(1).optional(),
  isArchived: z.boolean().optional(),
});

export const reorderBoardSchema = z.object({
  beforeId: uuidSchema.nullable().optional(),
  afterId: uuidSchema.nullable().optional(),
});

export const addBoardMemberSchema = z.object({
  userId: uuidSchema,
  role: z.enum(BOARD_ROLES).default("member"),
});

export const updateBoardMemberRoleSchema = z.object({
  role: z.enum(BOARD_ROLES),
});

export const createListSchema = z.object({
  boardId: uuidSchema,
  name: z.string().trim().min(1).max(100),
  position: z.number().optional(),
});
export type CreateListInput = z.infer<typeof createListSchema>;

export const updateListSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  isArchived: z.boolean().optional(),
});

/** The server computes a fractional position between these two neighbors
 *  (either may be omitted for "move to start/end") — see utils/position.ts. */
export const reorderListSchema = z.object({
  beforeId: uuidSchema.nullable().optional(),
  afterId: uuidSchema.nullable().optional(),
});

export const createLabelSchema = z.object({
  boardId: uuidSchema,
  name: z.string().trim().max(80).nullable().optional(),
  color: z.string().min(1),
});

export const updateLabelSchema = z.object({
  name: z.string().trim().max(80).nullable().optional(),
  color: z.string().min(1).optional(),
});
