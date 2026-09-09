import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";
import type { UserStatus } from "@endlessbacklog/shared";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare passwordHash: string | null;
  declare displayName: string;
  declare avatarUrl: string | null;
  declare status: CreationOptional<UserStatus>;
  declare emailVerifiedAt: Date | null;
  declare totpEnabled: CreationOptional<boolean>;
  declare totpSecretEncrypted: string | null;
  declare totpBackupCodesHash: string[] | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: true },
    displayName: { type: DataTypes.STRING(80), allowNull: false },
    avatarUrl: { type: DataTypes.STRING(500), allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "active" },
    emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
    totpEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    totpSecretEncrypted: { type: DataTypes.STRING(500), allowNull: true },
    totpBackupCodesHash: { type: DataTypes.JSON, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    hooks: {
      beforeValidate: (user) => {
        if (user.email) user.email = user.email.trim().toLowerCase();
      },
    },
  },
);
