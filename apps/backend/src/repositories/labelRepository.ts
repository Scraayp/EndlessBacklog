import { Label } from "../models/index.js";

export const labelRepository = {
  findById(id: string) {
    return Label.findByPk(id);
  },
  listForBoard(boardId: string) {
    return Label.findAll({ where: { boardId }, order: [["createdAt", "ASC"]] });
  },
  create(data: { boardId: string; name: string | null; color: string }) {
    return Label.create(data);
  },
  destroy(id: string) {
    return Label.destroy({ where: { id } });
  },
};
