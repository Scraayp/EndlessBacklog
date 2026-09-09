import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";
import type { BoardBackgroundType } from "@endlessbacklog/shared";

export class Board extends Model<InferAttributes<Board>, InferCreationAttributes<Board>> {
  declare id: CreationOptional<string>;
  declare workspaceId: string;
  declare name: string;
  declare backgroundType: CreationOptional<BoardBackgroundType>;
  declare backgroundValue: CreationOptional<string>;
  declare isArchived: CreationOptional<boolean>;
  declare position: number;
  declare createdById: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Board.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    workspaceId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    backgroundType: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "color" },
    backgroundValue: { type: DataTypes.STRING(500), allowNull: false, defaultValue: "#4bce97" },
    isArchived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    position: { type: DataTypes.FLOAT, allowNull: false },
    createdById: { type: DataTypes.UUID, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: "Board", tableName: "boards" },
);
