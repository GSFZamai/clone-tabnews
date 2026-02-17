import { NewUserRequest, User } from "models/user";
import orchestrator from "tests/orchestrator";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexisting 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UnexistingUser",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
        },
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

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "userDuplicado1",
      });

      await orchestrator.createUser({
        username: "userDuplicado2",
      });

      const patchResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users/userDuplicado2",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: "userDuplicado1",
          } satisfies Partial<NewUserRequest>),
        },
      );

      const patchResponseBody = await patchResponse.json();

      expect(patchResponse.status).toBe(400);
      expect(patchResponseBody).toEqual({
        message: "Nome de usuário já utilizado.",
        action: "Insira outro nome de usuário e tente novamente.",
        status_code: 400,
        name: "ValidationError",
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "patchemailduplicado1@teste.com",
      });

      const createdUser = await orchestrator.createUser({
        email: "patchemailduplicado2@teste.com",
      });

      const patchResponse: Response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "patchemailduplicado1@teste.com",
          } satisfies Partial<NewUserRequest>),
        },
      );

      const patchResponseBody = await patchResponse.json();

      expect(patchResponse.status).toBe(400);
      expect(patchResponseBody).toEqual({
        message: "Email já utilizado.",
        action: "Insira outro email e tente novamente.",
        status_code: 400,
        name: "ValidationError",
      });
    });

    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser();

      const patchResponse: Response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          } satisfies Partial<NewUserRequest>),
        },
      );

      expect(patchResponse.status).toBe(200);

      const updatedUser: User = await patchResponse.json();

      expect(patchResponse.status).toBe(200);
      expect(updatedUser.updated_at > updatedUser.created_at).toBe(true);
      expect(updatedUser).toEqual({
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        email: createdUser.email,
        username: "uniqueUser2",
        id: createdUser.id,
        password: createdUser.password,
      } satisfies User);

      const correctPassword = await password.compare(
        "validPassword",
        updatedUser.password,
      );
      const incorrectPassword = await password.compare(
        "invalidPassword",
        updatedUser.password,
      );

      expect(correctPassword).toBe(true);
      expect(incorrectPassword).toBe(false);
    });

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser();

      const patchResponse: Response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "newEmail@teste.com",
          } satisfies Partial<NewUserRequest>),
        },
      );

      expect(patchResponse.status).toBe(200);

      const updatedUser: User = await patchResponse.json();

      expect(patchResponse.status).toBe(200);
      expect(updatedUser.updated_at > updatedUser.created_at).toBe(true);
      expect(updatedUser).toEqual({
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        email: "newEmail@teste.com",
        username: createdUser.username,
        id: createdUser.id,
        password: createdUser.password,
      } satisfies User);

      const correctPassword = await password.compare(
        "validPassword",
        updatedUser.password,
      );
      const incorrectPassword = await password.compare(
        "invalidPassword",
        updatedUser.password,
      );

      expect(correctPassword).toBe(true);
      expect(incorrectPassword).toBe(false);
    });

    test("With new password", async () => {
      const createdUser = await orchestrator.createUser();

      const patchResponse: Response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            password: "novaSenha",
          } satisfies Partial<NewUserRequest>),
        },
      );

      expect(patchResponse.status).toBe(200);

      const updatedUser = await patchResponse.json();

      expect(patchResponse.status).toBe(200);
      expect(updatedUser.updated_at > updatedUser.created_at).toBe(true);
      expect(updatedUser).toEqual({
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        email: createdUser.email,
        username: createdUser.username,
        id: updatedUser.id,
        password: updatedUser.password,
      } satisfies User);

      const correctPassword = await password.compare(
        "novaSenha",
        updatedUser.password,
      );
      const incorrectPassword = await password.compare(
        "senhaInvalida",
        updatedUser.password,
      );

      expect(correctPassword).toBe(true);
      expect(incorrectPassword).toBe(false);
    });
  });
});
