import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";

export class Comment extends Model<InferAttributes<Comment>, InferCreationAttributes<Comment>> {
  declare id: CreationOptional<string>;
  declare cardId: string;
  declare authorId: string;
  declare bodyHtml: string;
  declare editedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
}

Comment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cardId: { type: DataTypes.UUID, allowNull: false },
    authorId: { type: DataTypes.UUID, allowNull: false },
    bodyHtml: { type: DataTypes.TEXT, allowNull: false },
    editedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: "Comment", tableName: "comments", updatedAt: false },
);
