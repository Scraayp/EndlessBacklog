import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";

export class ChecklistItem extends Model<InferAttributes<ChecklistItem>, InferCreationAttributes<ChecklistItem>> {
  declare id: CreationOptional<string>;
  declare checklistId: string;
  declare text: string;
  declare isChecked: CreationOptional<boolean>;
  declare position: number;
  declare dueDate: Date | null;
  declare assigneeId: string | null;
  declare createdAt: CreationOptional<Date>;
}

ChecklistItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    checklistId: { type: DataTypes.UUID, allowNull: false },
    text: { type: DataTypes.STRING(500), allowNull: false },
    isChecked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    position: { type: DataTypes.FLOAT, allowNull: false },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    assigneeId: { type: DataTypes.UUID, allowNull: true },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: "ChecklistItem", tableName: "checklist_items", updatedAt: false },
);
