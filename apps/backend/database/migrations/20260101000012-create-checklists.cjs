"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("checklists", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      card_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "cards", key: "id" },
        onDelete: "CASCADE",
      },
      title: { type: Sequelize.STRING(150), allowNull: false, defaultValue: "Checklist" },
      position: { type: Sequelize.FLOAT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("checklists", ["card_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("checklists");
  },
};
