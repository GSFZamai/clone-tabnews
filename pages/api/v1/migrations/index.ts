import controller from "infra/controller";
import { Client } from "pg";
import database from "infra/database";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import migrationsRunner, { RunnerOption } from "node-pg-migrate";
import { resolve } from "node:path";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.defaultHandlers);

const migrationRunnerConfig = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  migrationsTable: "pgmigrations",
  dryRun: true,
  verbose: true,
} as RunnerOption;

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  let dbClient: Client;
  try {
    dbClient = await database.getNewDbClient();
    const pendingMigrations = await migrationsRunner({
      ...migrationRunnerConfig,
      dbClient,
    });

    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  let dbClient: Client;

  try {
    dbClient = await database.getNewDbClient();

    const migratedMigrations = await migrationsRunner({
      ...migrationRunnerConfig,
      dbClient,
      dryRun: false,
    });
    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  } finally {
    await dbClient.end();
  }
}
