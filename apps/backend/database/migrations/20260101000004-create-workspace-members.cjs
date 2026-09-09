"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("workspace_members", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "workspaces", key: "id" },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      invited_email: { type: Sequelize.STRING(255), allowNull: true },
      role: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "member" },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "active" },
      invite_token_hash: { type: Sequelize.STRING(255), allowNull: true },
      invite_expires_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("workspace_members", ["workspace_id", "user_id"], {
      unique: true,
      name: "workspace_members_workspace_user_unique",
    });
    await queryInterface.addIndex("workspace_members", ["user_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("workspace_members");
  },
};
