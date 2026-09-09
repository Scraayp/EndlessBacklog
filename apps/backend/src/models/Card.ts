import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type BelongsToManyAddAssociationMixin,
  type BelongsToManyRemoveAssociationMixin,
} from "sequelize";
import { sequelize } from "../config/database.js";
import type { Label } from "./Label.js";
import type { User } from "./User.js";

export class Card extends Model<InferAttributes<Card>, InferCreationAttributes<Card>> {
  declare id: CreationOptional<string>;
  declare listId: string;
  declare boardId: string;
  declare title: string;
  declare descriptionHtml: string | null;
  declare position: number;
  declare dueDate: Date | null;
  declare dueReminderSentAt: Date | null;
  declare isArchived: CreationOptional<boolean>;
  declare coverAttachmentId: string | null;
  declare createdById: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Association mixins (wired up in models/index.ts via belongsToMany)
  declare addLabel: BelongsToManyAddAssociationMixin<Label, string>;
  declare removeLabel: BelongsToManyRemoveAssociationMixin<Label, string>;
  declare addMember: BelongsToManyAddAssociationMixin<User, string>;
  declare removeMember: BelongsToManyRemoveAssociationMixin<User, string>;
}

Card.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    listId: { type: DataTypes.UUID, allowNull: false },
    boardId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    descriptionHtml: { type: DataTypes.TEXT, allowNull: true },
    position: { type: DataTypes.FLOAT, allowNull: false },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    dueReminderSentAt: { type: DataTypes.DATE, allowNull: true },
    isArchived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    coverAttachmentId: { type: DataTypes.UUID, allowNull: true },
    createdById: { type: DataTypes.UUID, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: "Card", tableName: "cards" },
);
