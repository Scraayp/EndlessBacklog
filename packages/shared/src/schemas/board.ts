import { z } from "zod";
import { BOARD_ROLES } from "../constants/roles.js";
import { hexColorSchema, uuidSchema } from "./common.js";

/** backgroundValue must be a hex color for "color", a known gradient key for
 *  "gradient", or an https:// URL for "image" — checked against the actual
 *  backgroundType so a board can never end up with a mismatched pair. */
function validBackgroundValue(data: { backgroundType?: string; backgroundValue?: string }): boolean {
  if (!data.backgroundValue) return true;
  if (data.backgroundType === "gradient") return /^[a-z0-9-]+$/.test(data.backgroundValue);
  if (data.backgroundType === "image") return /^https:\/\/\S+$/.test(data.backgroundValue);
  if (data.backgroundType === "color" || !data.backgroundType) return hexColorSchema.safeParse(data.backgroundValue).success;
  return true;
}

const backgroundValueRefinement = {
  message: "backgroundValue doesn't match backgroundType",
  path: ["backgroundValue"],
};

export const createBoardSchema = z
  .object({
    workspaceId: uuidSchema,
    name: z.string().trim().min(1).max(100),
    backgroundType: z.enum(["color", "gradient", "image"]).optional(),
    backgroundValue: z.string().min(1).max(500).optional(),
  })
  .refine(validBackgroundValue, backgroundValueRefinement);

export const updateBoardSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    backgroundType: z.enum(["color", "gradient", "image"]).optional(),
    backgroundValue: z.string().min(1).max(500).optional(),
    isArchived: z.boolean().optional(),
  })
  .refine(validBackgroundValue, backgroundValueRefinement);

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
