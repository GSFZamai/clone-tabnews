import database from "infra/database";
import { StatusResponse } from "pages/api/v1/status";

export async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

beforeAll(cleanDatabase);

describe("Verifies if the connection is closed after calling DELETE method", () => {
  test("If the the DELETE call to the endpoint migrations returns 405", async () => {
    const response: Response = await fetch(
      "http://localhost:3000/api/v1/migrations",
      {
        method: "DELETE",
      },
    );
    expect(response.status).toBe(405);
  });

  test("If the GET call to the endpoint Status after calling delete on results on only one database openned connection", async () => {
    let response: Response = await fetch("http://localhost:3000/api/v1/status");
    let responseBody: StatusResponse = await response.json();

    let parsedDate = new Date(responseBody.updated_at).toISOString();

    expect(response.status).toBe(200);
    expect(responseBody.dependencies.database.version).toEqual("16.8");
    expect(responseBody.dependencies.database.max_connections).toBe(100);
    expect(responseBody.dependencies.database.opened_connections).toBe(1);
    expect(parsedDate).toEqual(responseBody.updated_at);
  });
});
