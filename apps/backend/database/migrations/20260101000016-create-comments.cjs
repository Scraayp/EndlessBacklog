"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("comments", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      card_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "cards", key: "id" },
        onDelete: "CASCADE",
      },
      author_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
      },
      body_html: { type: Sequelize.TEXT, allowNull: false },
      edited_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("comments", ["card_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("comments");
  },
};
