"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("activity_logs", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      board_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "boards", key: "id" },
        onDelete: "CASCADE",
      },
      card_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "cards", key: "id" },
        onDelete: "CASCADE",
      },
      actor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
      },
      type: { type: Sequelize.STRING(60), allowNull: false },
      metadata: { type: Sequelize.JSON, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("activity_logs", ["board_id"]);
    await queryInterface.addIndex("activity_logs", ["card_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("activity_logs");
  },
};
