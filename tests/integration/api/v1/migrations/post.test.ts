import database from "infra/database";
import orchestrator from "tests/orquestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await cleanDatabase();
});

export async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

describe("The POST call to the migrations endpoint must run migrations only once", () => {
  test("If the first POST call to the endpoint migrations returns 201 and apply migrations", async () => {
    const response: Response = await fetch(
      "http://localhost:3000/api/v1/migrations",
      {
        method: "POST",
      },
    );

    const responseBody = await response.json();
    expect(response.status).toBe(201);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test("If the second POST call to the endpoint migrations returns 200 and don't have migrations to aplly", async () => {
    const response: Response = await fetch(
      "http://localhost:3000/api/v1/migrations",
      {
        method: "POST",
      },
    );

    const responseBody = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});
