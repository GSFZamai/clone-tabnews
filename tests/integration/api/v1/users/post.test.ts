import { version } from "uuid";
import { NewUserRequest, User } from "models/user";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data should create a new user", async () => {
      const response: Response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "gsfzamai@gmail.com",
            username: "gsfzamai",
            password: "senha@123",
          } as NewUserRequest),
        },
      );

      const responseBody: User = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "gsfzamai",
        email: "gsfzamai@gmail.com",
        password: "senha@123",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(version(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With duplicated email should not create a new user", async () => {
      const firstResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "emailduplicado@teste.com",
            username: "emailduplicado1",
            password: "senha@123",
          } as NewUserRequest),
        },
      );

      expect(firstResponse.status).toBe(201);

      const secondResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "emailduplicado@teste.com",
            username: "emailduplicado2",
            password: "senha@123",
          } as NewUserRequest),
        },
      );

      const secondResponseBody = await secondResponse.json();

      expect(secondResponse.status).toBe(400);
      expect(secondResponseBody).toEqual({
        message: "Email já utilizado.",
        action: "Insira outro email e tente novamente.",
        status_code: 400,
        name: "ValidationError",
      });
    });

    test("With duplicated username should not create a new user", async () => {
      const firstResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "usernameduplicado1@teste.com",
            username: "usernameduplicado",
            password: "senha@123",
          } as NewUserRequest),
        },
      );

      expect(firstResponse.status).toBe(201);

      const secondResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "usernameduplicado2@teste.com",
            username: "usernameduplicado",
            password: "senha@123",
          } as NewUserRequest),
        },
      );

      const secondResponseBody = await secondResponse.json();

      expect(secondResponse.status).toBe(400);
      expect(secondResponseBody).toEqual({
        message: "Nome de usuário já utilizado.",
        action: "Insira outro nome de usuário e tente novamente.",
        status_code: 400,
        name: "ValidationError",
      });
    });
  });
});
