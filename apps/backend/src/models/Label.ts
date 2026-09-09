import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";

export class Label extends Model<InferAttributes<Label>, InferCreationAttributes<Label>> {
  declare id: CreationOptional<string>;
  declare boardId: string;
  declare name: string | null;
  declare color: string;
  declare createdAt: CreationOptional<Date>;
}

Label.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    boardId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(80), allowNull: true },
    color: { type: DataTypes.STRING(20), allowNull: false },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: "Label", tableName: "labels", updatedAt: false },
);
