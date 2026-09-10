import type { BoardRole } from "../constants/roles.js";
import type { UserPublic } from "./auth.js";

export type BoardBackgroundType = "color" | "gradient" | "image";

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  backgroundType: BoardBackgroundType;
  /** Hex string for "color", a curated gradient key for "gradient" (see
   *  constants/boardBackgrounds.ts), or an https:// image URL for "image". */
  backgroundValue: string;
  isArchived: boolean;
  position: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  createdAt: string;
}

export interface BoardMemberWithUser extends BoardMember {
  user: UserPublic;
}

export interface BoardWithMembership extends Board {
  myRole: BoardRole;
}

export interface List {
  id: string;
  boardId: string;
  name: string;
  position: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  boardId: string;
  name: string | null;
  /** Key into LABEL_COLORS (packages/shared/src/constants/labelColors.ts). */
  color: string;
  createdAt: string;
}
