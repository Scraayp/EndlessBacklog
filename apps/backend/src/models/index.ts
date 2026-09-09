import { User } from "./User.js";
import { OAuthAccount } from "./OAuthAccount.js";
import { Workspace } from "./Workspace.js";
import { WorkspaceMember } from "./WorkspaceMember.js";
import { Board } from "./Board.js";
import { BoardMember } from "./BoardMember.js";
import { List } from "./List.js";
import { Card } from "./Card.js";
import { Label } from "./Label.js";
import { CardLabel } from "./CardLabel.js";
import { CardMember } from "./CardMember.js";
import { Checklist } from "./Checklist.js";
import { ChecklistItem } from "./ChecklistItem.js";
import { Attachment } from "./Attachment.js";
import { Comment } from "./Comment.js";
import { CommentMention } from "./CommentMention.js";
import { ActivityLog } from "./ActivityLog.js";
import { Notification } from "./Notification.js";

// --- User -------------------------------------------------------------
User.hasMany(OAuthAccount, { foreignKey: "userId", as: "oauthAccounts", onDelete: "CASCADE" });
OAuthAccount.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

// --- Workspace ----------------------------------------------------------
Workspace.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
Workspace.hasMany(WorkspaceMember, { foreignKey: "workspaceId", as: "members", onDelete: "CASCADE" });
WorkspaceMember.belongsTo(Workspace, { foreignKey: "workspaceId", as: "workspace" });
WorkspaceMember.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(WorkspaceMember, { foreignKey: "userId", as: "workspaceMemberships" });

Workspace.hasMany(Board, { foreignKey: "workspaceId", as: "boards", onDelete: "CASCADE" });
Board.belongsTo(Workspace, { foreignKey: "workspaceId", as: "workspace" });
Board.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

// --- Board ----------------------------------------------------------
Board.hasMany(BoardMember, { foreignKey: "boardId", as: "members", onDelete: "CASCADE" });
BoardMember.belongsTo(Board, { foreignKey: "boardId", as: "board" });
BoardMember.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(BoardMember, { foreignKey: "userId", as: "boardMemberships" });

Board.hasMany(List, { foreignKey: "boardId", as: "lists", onDelete: "CASCADE" });
List.belongsTo(Board, { foreignKey: "boardId", as: "board" });

Board.hasMany(Label, { foreignKey: "boardId", as: "labels", onDelete: "CASCADE" });
Label.belongsTo(Board, { foreignKey: "boardId", as: "board" });

Board.hasMany(Card, { foreignKey: "boardId", as: "cards", onDelete: "CASCADE" });
Card.belongsTo(Board, { foreignKey: "boardId", as: "board" });

Board.hasMany(ActivityLog, { foreignKey: "boardId", as: "activityLogs", onDelete: "CASCADE" });
ActivityLog.belongsTo(Board, { foreignKey: "boardId", as: "board" });
ActivityLog.belongsTo(User, { foreignKey: "actorId", as: "actor" });
ActivityLog.belongsTo(Card, { foreignKey: "cardId", as: "card" });

// --- List / Card ----------------------------------------------------------
List.hasMany(Card, { foreignKey: "listId", as: "cards", onDelete: "CASCADE" });
Card.belongsTo(List, { foreignKey: "listId", as: "list" });
Card.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

// --- Card labels / members (many-to-many) ----------------------------------
Card.belongsToMany(Label, { through: CardLabel, foreignKey: "cardId", otherKey: "labelId", as: "labels" });
Label.belongsToMany(Card, { through: CardLabel, foreignKey: "labelId", otherKey: "cardId", as: "cards" });

Card.belongsToMany(User, { through: CardMember, foreignKey: "cardId", otherKey: "userId", as: "members" });
User.belongsToMany(Card, { through: CardMember, foreignKey: "userId", otherKey: "cardId", as: "assignedCards" });

// --- Checklists ----------------------------------------------------------
Card.hasMany(Checklist, { foreignKey: "cardId", as: "checklists", onDelete: "CASCADE" });
Checklist.belongsTo(Card, { foreignKey: "cardId", as: "card" });

Checklist.hasMany(ChecklistItem, { foreignKey: "checklistId", as: "items", onDelete: "CASCADE" });
ChecklistItem.belongsTo(Checklist, { foreignKey: "checklistId", as: "checklist" });
ChecklistItem.belongsTo(User, { foreignKey: "assigneeId", as: "assignee" });

// --- Attachments ----------------------------------------------------------
Card.hasMany(Attachment, { foreignKey: "cardId", as: "attachments", onDelete: "CASCADE" });
Attachment.belongsTo(Card, { foreignKey: "cardId", as: "card" });
Attachment.belongsTo(User, { foreignKey: "uploadedById", as: "uploadedBy" });
Card.belongsTo(Attachment, { foreignKey: "coverAttachmentId", as: "coverAttachment", constraints: false });

// --- Comments ----------------------------------------------------------
Card.hasMany(Comment, { foreignKey: "cardId", as: "comments", onDelete: "CASCADE" });
Comment.belongsTo(Card, { foreignKey: "cardId", as: "card" });
Comment.belongsTo(User, { foreignKey: "authorId", as: "author" });

Comment.belongsToMany(User, { through: CommentMention, foreignKey: "commentId", otherKey: "userId", as: "mentionedUsers" });
User.belongsToMany(Comment, { through: CommentMention, foreignKey: "userId", otherKey: "commentId", as: "mentionedInComments" });

export {
  User,
  OAuthAccount,
  Workspace,
  WorkspaceMember,
  Board,
  BoardMember,
  List,
  Card,
  Label,
  CardLabel,
  CardMember,
  Checklist,
  ChecklistItem,
  Attachment,
  Comment,
  CommentMention,
  ActivityLog,
  Notification,
};
