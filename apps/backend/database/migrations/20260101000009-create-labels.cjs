"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("labels", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      board_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "boards", key: "id" },
        onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING(80), allowNull: true },
      color: { type: Sequelize.STRING(20), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("labels", ["board_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("labels");
  },
};
