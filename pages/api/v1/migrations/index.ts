import database from "infra/database";
import { NextApiRequest, NextApiResponse } from "next";
import migrationsRunner, { RunnerOption } from "node-pg-migrate";
import path from "node:path";

export default async function migrations(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const allowedMethods = ["POST", "GET"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method ${request.method} not allowed.`,
    });
  }
  let dbClient;
  try {
    dbClient = await database.getNewDbClient();
    const migrationRunnerConfig: RunnerOption = {
      dbClient: dbClient,
      dir: path.join("infra", "migrations"),
      direction: "up",
      migrationsTable: "pgmigrations",
      dryRun: true,
      verbose: true,
    };
    if (request.method === "GET") {
      const pendingMigrations = await migrationsRunner(migrationRunnerConfig);

      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationsRunner({
        ...migrationRunnerConfig,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }
      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
