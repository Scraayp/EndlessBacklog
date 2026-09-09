import { Checklist, ChecklistItem, Card } from "../models/index.js";

export const checklistRepository = {
  findById(id: string) {
    return Checklist.findByPk(id);
  },
  async lastPosition(cardId: string): Promise<number | null> {
    const last = await Checklist.findOne({ where: { cardId }, order: [["position", "DESC"]] });
    return last?.position ?? null;
  },
  create(data: { cardId: string; title: string; position: number }) {
    return Checklist.create(data);
  },
  destroy(id: string) {
    return Checklist.destroy({ where: { id } });
  },
  findItemById(id: string) {
    return ChecklistItem.findByPk(id);
  },
  async lastItemPosition(checklistId: string): Promise<number | null> {
    const last = await ChecklistItem.findOne({ where: { checklistId }, order: [["position", "DESC"]] });
    return last?.position ?? null;
  },
  createItem(data: { checklistId: string; text: string; position: number; dueDate?: Date | null; assigneeId?: string | null }) {
    return ChecklistItem.create(data);
  },
  destroyItem(id: string) {
    return ChecklistItem.destroy({ where: { id } });
  },
  async getCardIdForChecklist(checklistId: string): Promise<string | undefined> {
    const checklist = await Checklist.findByPk(checklistId);
    return checklist?.cardId;
  },
  async getCardIdForItem(itemId: string): Promise<string | undefined> {
    const item = await ChecklistItem.findByPk(itemId);
    if (!item) return undefined;
    const checklist = await Checklist.findByPk(item.checklistId);
    return checklist?.cardId;
  },
  async getBoardIdForCard(cardId: string): Promise<string | undefined> {
    const card = await Card.findByPk(cardId);
    return card?.boardId;
  },
};
