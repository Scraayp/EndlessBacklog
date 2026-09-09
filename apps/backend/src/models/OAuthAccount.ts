import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";
import type { OAuthProvider } from "@endlessbacklog/shared";

export class OAuthAccount extends Model<InferAttributes<OAuthAccount>, InferCreationAttributes<OAuthAccount>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare provider: OAuthProvider;
  declare providerAccountId: string;
  declare createdAt: CreationOptional<Date>;
}

OAuthAccount.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    provider: { type: DataTypes.STRING(20), allowNull: false },
    providerAccountId: { type: DataTypes.STRING(255), allowNull: false },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "OAuthAccount",
    tableName: "oauth_accounts",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["provider", "provider_account_id"] }],
  },
);
