"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("checklist_items", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      checklist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "checklists", key: "id" },
        onDelete: "CASCADE",
      },
      text: { type: Sequelize.STRING(500), allowNull: false },
      is_checked: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      position: { type: Sequelize.FLOAT, allowNull: false },
      due_date: { type: Sequelize.DATE, allowNull: true },
      assignee_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("checklist_items", ["checklist_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("checklist_items");
  },
};
