import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";
import type { ActivityType } from "@endlessbacklog/shared";

export class ActivityLog extends Model<InferAttributes<ActivityLog>, InferCreationAttributes<ActivityLog>> {
  declare id: CreationOptional<string>;
  declare boardId: string;
  declare cardId: string | null;
  declare actorId: string;
  declare type: ActivityType;
  declare metadata: CreationOptional<Record<string, unknown>>;
  declare createdAt: CreationOptional<Date>;
}

ActivityLog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    boardId: { type: DataTypes.UUID, allowNull: false },
    cardId: { type: DataTypes.UUID, allowNull: true },
    actorId: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.STRING(60), allowNull: false },
    metadata: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: "ActivityLog", tableName: "activity_logs", updatedAt: false },
);
