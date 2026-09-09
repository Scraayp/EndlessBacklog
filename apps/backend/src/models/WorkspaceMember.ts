import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes, type NonAttribute } from "sequelize";
import { sequelize } from "../config/database.js";
import type { WorkspaceRole, WorkspaceMemberStatus } from "@endlessbacklog/shared";
import type { Workspace } from "./Workspace.js";
import type { User } from "./User.js";

export class WorkspaceMember extends Model<InferAttributes<WorkspaceMember>, InferCreationAttributes<WorkspaceMember>> {
  declare id: CreationOptional<string>;
  declare workspaceId: string;
  declare userId: string | null;
  declare invitedEmail: string | null;
  declare role: WorkspaceRole;
  declare status: WorkspaceMemberStatus;
  declare inviteTokenHash: string | null;
  declare inviteExpiresAt: Date | null;
  declare createdAt: CreationOptional<Date>;

  // Eager-loaded association accessors (populated via `include`, see models/index.ts)
  declare workspace?: NonAttribute<Workspace>;
  declare user?: NonAttribute<User>;
}

WorkspaceMember.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    workspaceId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: true },
    invitedEmail: { type: DataTypes.STRING(255), allowNull: true },
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "member" },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "active" },
    inviteTokenHash: { type: DataTypes.STRING(255), allowNull: true },
    inviteExpiresAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "WorkspaceMember",
    tableName: "workspace_members",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["workspace_id", "user_id"] }],
  },
);
