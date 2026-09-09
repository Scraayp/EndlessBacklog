"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("board_members", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      board_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "boards", key: "id" },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      role: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "member" },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("board_members", ["board_id", "user_id"], {
      unique: true,
      name: "board_members_board_user_unique",
    });
    await queryInterface.addIndex("board_members", ["user_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("board_members");
  },
};
