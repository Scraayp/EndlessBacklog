import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";
import type { NotificationType } from "@endlessbacklog/shared";

export class Notification extends Model<InferAttributes<Notification>, InferCreationAttributes<Notification>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare type: NotificationType;
  declare payload: CreationOptional<Record<string, unknown>>;
  declare isRead: CreationOptional<boolean>;
  declare readAt: Date | null;
  declare createdAt: CreationOptional<Date>;
}

Notification.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.STRING(40), allowNull: false },
    payload: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    readAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: "Notification", tableName: "notifications", updatedAt: false },
);
