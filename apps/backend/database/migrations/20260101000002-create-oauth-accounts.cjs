"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("oauth_accounts", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      provider: { type: Sequelize.STRING(20), allowNull: false },
      provider_account_id: { type: Sequelize.STRING(255), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("oauth_accounts", ["provider", "provider_account_id"], {
      unique: true,
      name: "oauth_accounts_provider_account_unique",
    });
    await queryInterface.addIndex("oauth_accounts", ["user_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("oauth_accounts");
  },
};
