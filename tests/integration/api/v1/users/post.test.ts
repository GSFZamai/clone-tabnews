import { version } from "uuid";
import user, { NewUserRequest, User } from "models/user";
import orchestrator from "tests/orchestrator";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
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
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      const createdUser = await user.findByUsername("gsfzamai");

      const correctPasswordCompare = await password.compare(
        "senha@123",
        createdUser.password,
      );

      const incorrectPasswordCompare = await password.compare(
        "SenhaIncorreta",
        createdUser.password,
      );

      expect(correctPasswordCompare).toBe(true);
      expect(incorrectPasswordCompare).toBe(false);
      expect(version(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With duplicated email", async () => {
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

    test("With duplicated username", async () => {
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
