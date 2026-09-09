import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes, type NonAttribute } from "sequelize";
import { sequelize } from "../config/database.js";
import type { BoardRole } from "@endlessbacklog/shared";
import type { User } from "./User.js";

export class BoardMember extends Model<InferAttributes<BoardMember>, InferCreationAttributes<BoardMember>> {
  declare id: CreationOptional<string>;
  declare boardId: string;
  declare userId: string;
  declare role: BoardRole;
  declare createdAt: CreationOptional<Date>;

  declare user?: NonAttribute<User>;
}

BoardMember.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    boardId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "member" },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "BoardMember",
    tableName: "board_members",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["board_id", "user_id"] }],
  },
);
