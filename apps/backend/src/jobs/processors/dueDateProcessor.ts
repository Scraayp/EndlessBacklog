import { cardRepository } from "../../repositories/cardRepository.js";
import { emailQueue, notificationQueue } from "../queues.js";
import { dueSoonTemplate } from "../emailTemplates.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

const LOOKAHEAD_HOURS = 24;

/** Repeatable job (every 15 min): finds cards due within the next 24h that
 *  haven't been reminded about yet, and notifies every assigned member. */
export async function processDueDateScanJob(): Promise<void> {
  const now = new Date();
  const cutoff = new Date(now.getTime() + LOOKAHEAD_HOURS * 60 * 60 * 1000);
  const cards = await cardRepository.findCardsDueBetween(now, cutoff);

  for (const card of cards) {
    const members = (card.get("members") as { id: string; email: string }[] | undefined) ?? [];
    const board = card.get("board") as { name: string } | undefined;
    const cardUrl = `${env.FRONTEND_URL}/boards/${card.boardId}/cards/${card.id}`;

    for (const member of members) {
      await notificationQueue.add("notify", {
        userId: member.id,
        type: "due_soon",
        payload: { cardId: card.id, cardTitle: card.title, boardId: card.boardId },
      });
    }

    // Email the members too (in addition to the in-app notification) — one
    // message per member, since Purelymail addresses are individual, not lists.
    if (members.length) {
      const { subject, html } = dueSoonTemplate({ cardTitle: card.title, boardName: board?.name ?? "Board", cardUrl });
      for (const member of members) {
        await emailQueue.add("due-soon", { to: member.email, subject, html });
      }
    }

    await cardRepository.markReminderSent(card.id);
  }

  logger.info({ count: cards.length }, "due-date scan complete");
}
