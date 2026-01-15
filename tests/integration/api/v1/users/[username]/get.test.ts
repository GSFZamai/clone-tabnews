import { NewUserRequest, User } from "models/user";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With case sensitive match", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: "case.sensitive@gsfzamai.dev.br",
          password: "senha@123",
          username: "gsfzamai",
        } satisfies NewUserRequest),
      });

      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch(
        "http://localhost:3000/api/v1/users/gsfzamai",
      );

      const secondResponseBody: User = await secondResponse.json();

      expect(secondResponse.status).toBe(200);
      expect(secondResponseBody).toEqual({
        created_at: secondResponseBody.created_at,
        email: "case.sensitive@gsfzamai.dev.br",
        id: secondResponseBody.id,
        password: "senha@123",
        updated_at: secondResponseBody.updated_at,
        username: "gsfzamai",
      } satisfies User);
    });

    test("With no case sensitive match", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/GSFZamai",
      );

      const responseBody: User = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        created_at: responseBody.created_at,
        email: "case.sensitive@gsfzamai.dev.br",
        id: responseBody.id,
        password: "senha@123",
        updated_at: responseBody.updated_at,
        username: "gsfzamai",
      } satisfies User);
    });

    test("With nonexisting username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UnexistingUser",
      );

      const responseBody: User = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toEqual({
        message: "Usuário não encontrado para os dados informados.",
        action: "Tente outro nome de usuário.",
        name: "NotFoundError",
        status_code: 404,
      });
    });
  });
});
