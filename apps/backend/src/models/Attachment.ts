import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";

export class Attachment extends Model<InferAttributes<Attachment>, InferCreationAttributes<Attachment>> {
  declare id: CreationOptional<string>;
  declare cardId: string;
  declare uploadedById: string;
  declare fileName: string;
  declare mimeType: string;
  declare sizeBytes: number;
  declare storageKey: string;
  declare isCover: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
}

Attachment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cardId: { type: DataTypes.UUID, allowNull: false },
    uploadedById: { type: DataTypes.UUID, allowNull: false },
    fileName: { type: DataTypes.STRING(255), allowNull: false },
    mimeType: { type: DataTypes.STRING(150), allowNull: false },
    sizeBytes: { type: DataTypes.BIGINT, allowNull: false },
    storageKey: { type: DataTypes.STRING(500), allowNull: false },
    isCover: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: "Attachment", tableName: "attachments", updatedAt: false },
);
