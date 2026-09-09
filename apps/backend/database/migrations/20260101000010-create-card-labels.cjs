"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("card_labels", {
      card_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: "cards", key: "id" },
        onDelete: "CASCADE",
      },
      label_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: "labels", key: "id" },
        onDelete: "CASCADE",
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("card_labels");
  },
};
