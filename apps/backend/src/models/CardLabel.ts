import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";

export class CardLabel extends Model<InferAttributes<CardLabel>, InferCreationAttributes<CardLabel>> {
  declare cardId: string;
  declare labelId: string;
}

CardLabel.init(
  {
    cardId: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    labelId: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  },
  { sequelize, modelName: "CardLabel", tableName: "card_labels", timestamps: false },
);
