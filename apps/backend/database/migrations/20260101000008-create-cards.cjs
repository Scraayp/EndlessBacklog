"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cards", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      list_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "lists", key: "id" },
        onDelete: "CASCADE",
      },
      board_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "boards", key: "id" },
        onDelete: "CASCADE",
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description_html: { type: Sequelize.TEXT, allowNull: true },
      position: { type: Sequelize.FLOAT, allowNull: false },
      due_date: { type: Sequelize.DATE, allowNull: true },
      due_reminder_sent_at: { type: Sequelize.DATE, allowNull: true },
      is_archived: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      // No FK constraint here — attachments (which cover_attachment_id points to)
      // is created after cards. The constraint is added in migration 000015.
      cover_attachment_id: { type: Sequelize.UUID, allowNull: true },
      created_by_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("cards", ["list_id"]);
    await queryInterface.addIndex("cards", ["board_id"]);
    await queryInterface.addIndex("cards", ["due_date"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("cards");
  },
};
