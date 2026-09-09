import { Comment, CommentMention, User, Card } from "../models/index.js";

export const commentRepository = {
  findById(id: string) {
    return Comment.findByPk(id, { include: [{ model: User, as: "author" }] });
  },
  create(data: { cardId: string; authorId: string; bodyHtml: string }) {
    return Comment.create(data);
  },
  async setMentions(commentId: string, userIds: string[]) {
    await CommentMention.destroy({ where: { commentId } });
    if (userIds.length > 0) {
      await CommentMention.bulkCreate(userIds.map((userId) => ({ commentId, userId })));
    }
  },
  destroy(id: string) {
    return Comment.destroy({ where: { id } });
  },
  async getBoardIdForCard(cardId: string): Promise<string | undefined> {
    const card = await Card.findByPk(cardId);
    return card?.boardId;
  },
  async getCardIdForComment(commentId: string): Promise<string | undefined> {
    const comment = await Comment.findByPk(commentId);
    return comment?.cardId;
  },
};
