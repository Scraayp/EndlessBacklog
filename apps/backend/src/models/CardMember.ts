import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";

export class CardMember extends Model<InferAttributes<CardMember>, InferCreationAttributes<CardMember>> {
  declare cardId: string;
  declare userId: string;
  declare assignedAt: CreationOptional<Date>;
}

CardMember.init(
  {
    cardId: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    assignedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "CardMember", tableName: "card_members", timestamps: false },
);
