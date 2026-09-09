"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("lists", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      board_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "boards", key: "id" },
        onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      position: { type: Sequelize.FLOAT, allowNull: false },
      is_archived: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("lists", ["board_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("lists");
  },
};
