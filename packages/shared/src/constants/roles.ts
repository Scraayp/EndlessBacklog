/**
 * Role enums shared between the API (RBAC middleware / Sequelize models)
 * and the frontend (conditional UI rendering).
 */

export const WORKSPACE_ROLES = ["admin", "member", "guest"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const BOARD_ROLES = ["admin", "member", "observer"] as const;
export type BoardRole = (typeof BOARD_ROLES)[number];

export const WORKSPACE_MEMBER_STATUSES = ["invited", "active"] as const;
export type WorkspaceMemberStatus = (typeof WORKSPACE_MEMBER_STATUSES)[number];

/** Simple ordering used for "is at least this role" checks (higher = more privilege). */
export const WORKSPACE_ROLE_RANK: Record<WorkspaceRole, number> = {
  guest: 0,
  member: 1,
  admin: 2,
};

export const BOARD_ROLE_RANK: Record<BoardRole, number> = {
  observer: 0,
  member: 1,
  admin: 2,
};

export function hasWorkspaceRoleAtLeast(role: WorkspaceRole, required: WorkspaceRole): boolean {
  return WORKSPACE_ROLE_RANK[role] >= WORKSPACE_ROLE_RANK[required];
}

export function hasBoardRoleAtLeast(role: BoardRole, required: BoardRole): boolean {
  return BOARD_ROLE_RANK[role] >= BOARD_ROLE_RANK[required];
}
