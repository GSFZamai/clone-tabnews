import database from "infra/database";
import { faker } from "@faker-js/faker";
import retry from "async-retry";
import migrator from "models/migrator";
import user, { NewUserRequest } from "models/user";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 5000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw Error();
      }
      await response.json();
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(newUser?: Partial<NewUserRequest>) {
  const createdUser = await user.create({
    email: newUser?.email || faker.internet.email(),
    password: newUser?.password || "validPassword",
    username:
      newUser?.username || faker.internet.username().replace(/[_.-]/g, ""),
  });

  return createdUser;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
