import { Attachment, Card } from "../models/index.js";

export const attachmentRepository = {
  findById(id: string) {
    return Attachment.findByPk(id);
  },
  listForCard(cardId: string) {
    return Attachment.findAll({ where: { cardId }, order: [["createdAt", "ASC"]] });
  },
  create(data: { cardId: string; uploadedById: string; fileName: string; mimeType: string; sizeBytes: number; storageKey: string }) {
    return Attachment.create(data);
  },
  destroy(id: string) {
    return Attachment.destroy({ where: { id } });
  },
  async getBoardIdForCard(cardId: string): Promise<string | undefined> {
    const card = await Card.findByPk(cardId);
    return card?.boardId;
  },
};
