"use strict";

const { randomUUID } = require("node:crypto");
const argon2 = require("argon2");

const DEMO_PASSWORD = "DemoPass123!";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const userId = randomUUID();
    const workspaceId = randomUUID();
    const boardId = randomUUID();
    const listIds = [randomUUID(), randomUUID(), randomUUID()];
    const labelIds = [randomUUID(), randomUUID(), randomUUID()];

    const passwordHash = await argon2.hash(DEMO_PASSWORD);

    await queryInterface.bulkInsert("users", [
      {
        id: userId,
        email: "demo@endlessbacklog.local",
        password_hash: passwordHash,
        display_name: "Demo User",
        status: "active",
        email_verified_at: now,
        totp_enabled: false,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("workspaces", [
      {
        id: workspaceId,
        name: "Demo Workspace",
        slug: "demo-workspace",
        description: "Seeded demo workspace for local development",
        created_by_id: userId,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("workspace_members", [
      {
        id: randomUUID(),
        workspace_id: workspaceId,
        user_id: userId,
        role: "admin",
        status: "active",
        created_at: now,
      },
    ]);

    await queryInterface.bulkInsert("boards", [
      {
        id: boardId,
        workspace_id: workspaceId,
        name: "Demo Board",
        background_type: "color",
        background_value: "#4bce97",
        is_archived: false,
        position: 65536,
        created_by_id: userId,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("board_members", [
      { id: randomUUID(), board_id: boardId, user_id: userId, role: "admin", created_at: now },
    ]);

    const listNames = ["To Do", "In Progress", "Done"];
    await queryInterface.bulkInsert(
      "lists",
      listIds.map((id, i) => ({
        id,
        board_id: boardId,
        name: listNames[i],
        position: (i + 1) * 65536,
        is_archived: false,
        created_at: now,
        updated_at: now,
      })),
    );

    const labelDefs = [
      { color: "green", name: "Feature" },
      { color: "yellow", name: "Blocked" },
      { color: "red", name: "Bug" },
    ];
    await queryInterface.bulkInsert(
      "labels",
      labelIds.map((id, i) => ({
        id,
        board_id: boardId,
        name: labelDefs[i].name,
        color: labelDefs[i].color,
        created_at: now,
      })),
    );

    const cardId1 = randomUUID();
    const cardId2 = randomUUID();
    const cardId3 = randomUUID();
    await queryInterface.bulkInsert("cards", [
      {
        id: cardId1,
        list_id: listIds[0],
        board_id: boardId,
        title: "Welcome to EndlessBacklog 👋",
        description_html: "<p>This is a seeded demo card. Drag it around!</p>",
        position: 65536,
        is_archived: false,
        created_by_id: userId,
        created_at: now,
        updated_at: now,
      },
      {
        id: cardId2,
        list_id: listIds[1],
        board_id: boardId,
        title: "Set up your first real workspace",
        position: 65536,
        is_archived: false,
        created_by_id: userId,
        created_at: now,
        updated_at: now,
      },
      {
        id: cardId3,
        list_id: listIds[2],
        board_id: boardId,
        title: "Delete the demo workspace when ready",
        position: 65536,
        is_archived: false,
        created_by_id: userId,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("card_labels", [{ card_id: cardId1, label_id: labelIds[0] }]);

    // eslint-disable-next-line no-console
    console.log(`Seeded demo data. Login with demo@endlessbacklog.local / ${DEMO_PASSWORD}`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("workspaces", { slug: "demo-workspace" });
    await queryInterface.bulkDelete("users", { email: "demo@endlessbacklog.local" });
  },
};
