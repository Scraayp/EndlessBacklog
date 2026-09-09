// Config consumed by sequelize-cli (migrations/seeders). Mirrors the runtime
// logic in src/config/database.ts so `sequelize-cli db:migrate` behaves
// identically to the app itself, regardless of DB_DIALECT.
//
// This is the ONE file that must stay dialect-neutral for both MariaDB and
// PostgreSQL: it only ever reads DB_DIALECT / DATABASE_URL from the
// environment. No dialect-specific branching belongs here.
require("dotenv").config();

/** @type {(dialect: string) => import('sequelize').Options} */
function optionsFor(dialect) {
  return {
    dialect,
    logging: false,
    dialectOptions:
      process.env.DB_SSL === "true"
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
  };
}

const dialect = process.env.DB_DIALECT || "postgres";
const url = process.env.DATABASE_URL || "";

const shared = {
  url,
  ...optionsFor(dialect),
};

module.exports = {
  development: shared,
  test: {
    ...shared,
    url: process.env.TEST_DATABASE_URL || url,
  },
  production: shared,
};
