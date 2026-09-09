import { List } from "../models/index.js";

export const listRepository = {
  findById(id: string) {
    return List.findByPk(id);
  },
  listForBoard(boardId: string, includeArchived = false) {
    return List.findAll({
      where: includeArchived ? { boardId } : { boardId, isArchived: false },
      order: [["position", "ASC"]],
    });
  },
  async lastPosition(boardId: string): Promise<number | null> {
    const last = await List.findOne({ where: { boardId }, order: [["position", "DESC"]] });
    return last?.position ?? null;
  },
  create(data: { boardId: string; name: string; position: number }) {
    return List.create(data);
  },
};
