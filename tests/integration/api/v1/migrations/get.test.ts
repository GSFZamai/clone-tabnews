import database from "infra/database";
import orchestrator from "tests/orquestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await cleanDatabase();
});

export async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

test("If the the GET call to the endpoint migrations returns 200", async () => {
  const response: Response = await fetch(
    "http://localhost:3000/api/v1/migrations",
  );
  const responseBody = await response.json();
  expect(response.status).toBe(200);
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
});
