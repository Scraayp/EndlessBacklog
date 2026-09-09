// @ts-check
import baseConfig from "@endlessbacklog/config-eslint";

export default [
  // Migrations/seeders are plain CommonJS tooling scripts driven by
  // sequelize-cli, not part of the app's TypeScript/ESM codebase — see
  // database/README.md for why they're .cjs in the first place.
  { ignores: ["database/**"] },
  ...baseConfig,
];
