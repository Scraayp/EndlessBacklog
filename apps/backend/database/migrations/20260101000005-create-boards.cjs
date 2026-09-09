"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("boards", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "workspaces", key: "id" },
        onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      background_type: { type: Sequelize.STRING(10), allowNull: false, defaultValue: "color" },
      background_value: { type: Sequelize.STRING(500), allowNull: false, defaultValue: "#4bce97" },
      is_archived: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      position: { type: Sequelize.FLOAT, allowNull: false },
      created_by_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("boards", ["workspace_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("boards");
  },
};
