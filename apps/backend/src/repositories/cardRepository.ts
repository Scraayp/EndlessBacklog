import {
  Card,
  Label,
  User,
  Checklist,
  ChecklistItem,
  Attachment,
  Comment,
  Board,
} from "../models/index.js";

const summaryIncludes = [
  { model: Label, as: "labels" },
  { model: User, as: "members" },
  { model: Checklist, as: "checklists", include: [{ model: ChecklistItem, as: "items" }] },
  { model: Attachment, as: "attachments" },
  { model: Comment, as: "comments", attributes: ["id"] },
];

const detailIncludes = [
  { model: Label, as: "labels" },
  { model: User, as: "members" },
  {
    model: Checklist,
    as: "checklists",
    separate: true,
    order: [["position", "ASC"]] as [string, string][],
    include: [
      { model: ChecklistItem, as: "items", separate: true, order: [["position", "ASC"]] as [string, string][] },
    ],
  },
  { model: Attachment, as: "attachments", separate: true, order: [["createdAt", "ASC"]] as [string, string][] },
  {
    model: Comment,
    as: "comments",
    separate: true,
    order: [["createdAt", "ASC"]] as [string, string][],
    include: [
      { model: User, as: "author" },
      { model: User, as: "mentionedUsers", attributes: ["id"], through: { attributes: [] } },
    ],
  },
];

export const cardRepository = {
  findById(id: string) {
    return Card.findByPk(id);
  },
  listForBoard(boardId: string, includeArchived = false) {
    return Card.findAll({
      where: includeArchived ? { boardId } : { boardId, isArchived: false },
      include: summaryIncludes,
      order: [["position", "ASC"]],
    });
  },
  findDetail(id: string) {
    return Card.findByPk(id, { include: detailIncludes });
  },
  async lastPositionInList(listId: string): Promise<number | null> {
    const last = await Card.findOne({ where: { listId }, order: [["position", "DESC"]] });
    return last?.position ?? null;
  },
  create(data: { listId: string; boardId: string; title: string; position: number; createdById: string }) {
    return Card.create(data);
  },
  async addLabel(cardId: string, labelId: string) {
    const card = await Card.findByPk(cardId);
    if (card) await card.addLabel(labelId);
  },
  async removeLabel(cardId: string, labelId: string) {
    const card = await Card.findByPk(cardId);
    if (card) await card.removeLabel(labelId);
  },
  async addMember(cardId: string, userId: string) {
    const card = await Card.findByPk(cardId);
    if (card) await card.addMember(userId);
  },
  async removeMember(cardId: string, userId: string) {
    const card = await Card.findByPk(cardId);
    if (card) await card.removeMember(userId);
  },
  findCardsDueBetween(start: Date, end: Date) {
    return Card.findAll({
      where: {
        isArchived: false,
        dueReminderSentAt: null,
      },
      include: [
        { model: User, as: "members" },
        { model: Board, as: "board" },
      ],
    }).then((cards) => cards.filter((c) => c.dueDate && c.dueDate >= start && c.dueDate <= end));
  },
  markReminderSent(cardId: string) {
    return Card.update({ dueReminderSentAt: new Date() }, { where: { id: cardId } });
  },
};
