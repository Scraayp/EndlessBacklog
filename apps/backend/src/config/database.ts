import { Sequelize } from "sequelize";
import { env } from "./env.js";
import { logger } from "./logger.js";

/**
 * The single Sequelize instance for the whole app. `dialect` is a plain
 * runtime string driven by DB_DIALECT — this is what makes switching between
 * MariaDB and PostgreSQL a config change, not a code change. See
 * apps/backend/database/README.md for the dialect-neutrality rules every
 * model/migration must follow.
 */
export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: env.DB_DIALECT,
  logging: (sql) => logger.debug({ sql }, "sequelize"),
  dialectOptions: env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  define: {
    underscored: true,
    timestamps: true,
  },
});

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
  logger.info({ dialect: env.DB_DIALECT }, "database connection established");
}
