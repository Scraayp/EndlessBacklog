"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attachments", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      card_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "cards", key: "id" },
        onDelete: "CASCADE",
      },
      uploaded_by_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
      },
      file_name: { type: Sequelize.STRING(255), allowNull: false },
      mime_type: { type: Sequelize.STRING(150), allowNull: false },
      size_bytes: { type: Sequelize.BIGINT, allowNull: false },
      storage_key: { type: Sequelize.STRING(500), allowNull: false },
      is_cover: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("attachments", ["card_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("attachments");
  },
};
