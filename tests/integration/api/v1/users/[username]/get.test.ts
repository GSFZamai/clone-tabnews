import { User } from "models/user";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With case sensitive match", async () => {
      const createdUser = await orchestrator.createUser({
        username: "gsfzamai",
      });

      const secondResponse = await fetch(
        "http://localhost:3000/api/v1/users/gsfzamai",
      );

      const secondResponseBody: User = await secondResponse.json();

      expect(secondResponse.status).toBe(200);
      expect(secondResponseBody).toEqual({
        created_at: secondResponseBody.created_at,
        email: createdUser.email,
        id: secondResponseBody.id,
        password: secondResponseBody.password,
        updated_at: secondResponseBody.updated_at,
        username: "gsfzamai",
      } satisfies User);
    });

    test("With no case sensitive match", async () => {
      const createdUser = await orchestrator.createUser({
        username: "CaseMismatch",
      });

      const secondResponse = await fetch(
        "http://localhost:3000/api/v1/users/casemismatch",
      );

      const secondResponseBody: User = await secondResponse.json();

      expect(secondResponse.status).toBe(200);
      expect(secondResponseBody).toEqual({
        created_at: secondResponseBody.created_at,
        email: createdUser.email,
        id: secondResponseBody.id,
        password: secondResponseBody.password,
        updated_at: secondResponseBody.updated_at,
        username: "CaseMismatch",
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
