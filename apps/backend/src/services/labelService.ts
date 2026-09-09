import { labelRepository } from "../repositories/labelRepository.js";
import { AppError } from "../utils/AppError.js";
import { LABEL_COLOR_KEYS } from "@endlessbacklog/shared";

export const labelService = {
  listForBoard(boardId: string) {
    return labelRepository.listForBoard(boardId);
  },

  async create(boardId: string, name: string | null | undefined, color: string) {
    if (!LABEL_COLOR_KEYS.includes(color)) throw AppError.badRequest("Unknown label color");
    return labelRepository.create({ boardId, name: name ?? null, color });
  },

  async update(labelId: string, data: { name?: string | null; color?: string }) {
    const label = await labelRepository.findById(labelId);
    if (!label) throw AppError.notFound("Label not found");
    if (data.color && !LABEL_COLOR_KEYS.includes(data.color)) throw AppError.badRequest("Unknown label color");
    if (data.name !== undefined) label.name = data.name;
    if (data.color !== undefined) label.color = data.color;
    await label.save();
    return label;
  },

  async remove(labelId: string) {
    const label = await labelRepository.findById(labelId);
    if (!label) throw AppError.notFound("Label not found");
    await labelRepository.destroy(labelId);
  },

  async get(labelId: string) {
    const label = await labelRepository.findById(labelId);
    if (!label) throw AppError.notFound("Label not found");
    return label;
  },
};
