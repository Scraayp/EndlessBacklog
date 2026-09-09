import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";

export class Checklist extends Model<InferAttributes<Checklist>, InferCreationAttributes<Checklist>> {
  declare id: CreationOptional<string>;
  declare cardId: string;
  declare title: string;
  declare position: number;
  declare createdAt: CreationOptional<Date>;
}

Checklist.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cardId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(150), allowNull: false, defaultValue: "Checklist" },
    position: { type: DataTypes.FLOAT, allowNull: false },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: "Checklist", tableName: "checklists", updatedAt: false },
);
