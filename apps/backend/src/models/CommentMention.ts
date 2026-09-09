import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";

export class CommentMention extends Model<InferAttributes<CommentMention>, InferCreationAttributes<CommentMention>> {
  declare commentId: string;
  declare userId: string;
}

CommentMention.init(
  {
    commentId: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  },
  { sequelize, modelName: "CommentMention", tableName: "comment_mentions", timestamps: false },
);
