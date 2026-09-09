"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: true },
      display_name: { type: Sequelize.STRING(80), allowNull: false },
      avatar_url: { type: Sequelize.STRING(500), allowNull: true },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "active" },
      email_verified_at: { type: Sequelize.DATE, allowNull: true },
      totp_enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      totp_secret_encrypted: { type: Sequelize.STRING(500), allowNull: true },
      totp_backup_codes_hash: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
