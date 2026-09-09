import { describe, it, expect } from "vitest";
import { notificationText, notificationLink } from "./notificationText.js";
import type { Notification } from "@endlessbacklog/shared";

function makeNotification(overrides: Partial<Notification>): Notification {
  return {
    id: "n1",
    userId: "u1",
    type: "card_assigned",
    payload: {},
    isRead: false,
    readAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("notificationText", () => {
  it("describes a card assignment", () => {
    const n = makeNotification({ type: "card_assigned", payload: { cardTitle: "Ship it" } });
    expect(notificationText(n)).toBe('You were added to "Ship it"');
  });

  it("describes a mention without needing card details", () => {
    const n = makeNotification({ type: "comment_mention" });
    expect(notificationText(n)).toBe("You were mentioned in a comment");
  });

  it("falls back gracefully for an unknown type", () => {
    const n = makeNotification({ type: "something_new" as Notification["type"] });
    expect(notificationText(n)).toBe("New notification");
  });
});

describe("notificationLink", () => {
  it("links to a card when both boardId and cardId are present", () => {
    const n = makeNotification({ payload: { boardId: "b1", cardId: "c1" } });
    expect(notificationLink(n)).toBe("/boards/b1/cards/c1");
  });

  it("links to just the board when only boardId is present", () => {
    const n = makeNotification({ payload: { boardId: "b1" } });
    expect(notificationLink(n)).toBe("/boards/b1");
  });

  it("returns null when there's nothing to link to", () => {
    const n = makeNotification({ payload: {} });
    expect(notificationLink(n)).toBeNull();
  });
});
