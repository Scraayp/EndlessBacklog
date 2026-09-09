"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint("cards", {
      fields: ["cover_attachment_id"],
      type: "foreign key",
      name: "cards_cover_attachment_id_fkey",
      references: { table: "attachments", field: "id" },
      onDelete: "SET NULL",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint("cards", "cards_cover_attachment_id_fkey");
  },
};
