import { Client } from "pg";
import database from "infra/database";
import migrationsRunner, { RunnerOption } from "node-pg-migrate";
import { resolve } from "node:path";
import { ServicesError } from "infra/errors";

const migrationRunnerConfig = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  migrationsTable: "pgmigrations",
  dryRun: true,
  log: (msg) => {
    msg;
  },
} as RunnerOption;

async function listPendingMigrations() {
  let dbClient: Client;
  try {
    dbClient = await database.getNewDbClient();
    const pendingMigrations = await migrationsRunner({
      ...migrationRunnerConfig,
      dbClient,
    });

    return pendingMigrations;
  } catch (error) {
    const serviceError = new ServicesError({
      cause: error,
      message: "Falha ao buscar migrations pendentes.",
    });

    throw serviceError;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient: Client;

  try {
    dbClient = await database.getNewDbClient();

    const migratedMigrations = await migrationsRunner({
      ...migrationRunnerConfig,
      dbClient,
      dryRun: false,
    });

    return migratedMigrations;
  } catch (error) {
    const serviceError = new ServicesError({
      cause: error,
      message: "Falha ao rodar as migrations pendentes.",
    });

    throw serviceError;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
