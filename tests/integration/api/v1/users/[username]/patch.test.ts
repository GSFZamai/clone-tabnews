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
      const firstResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "patchuserduplicado1@teste.com",
            username: "userDuplicado1",
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
            email: "patchuserduplicado2@teste.com",
            username: "userDuplicado2",
            password: "senha@123",
          } as NewUserRequest),
        },
      );

      expect(secondResponse.status).toBe(201);

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
      const firstResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "patchemailduplicado1@teste.com",
            username: "emailDuplicado1",
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
            email: "patchemailduplicado2@teste.com",
            username: "emailDuplicado2",
            password: "senha@123",
          } as NewUserRequest),
        },
      );

      expect(secondResponse.status).toBe(201);

      const patchResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users/emailDuplicado2",
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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: "uniqueUser1@teste.com",
          username: "uniqueUser1",
          password: "senha@123",
        } as NewUserRequest),
      });

      const patchResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
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

      const updatedUser = await patchResponse.json();

      expect(patchResponse.status).toBe(200);
      expect(updatedUser).toEqual({
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        email: "uniqueUser1@teste.com",
        username: "uniqueUser2",
        id: updatedUser.id,
        password: updatedUser.password,
      } satisfies User);

      const correctPassword = await password.compare(
        "senha@123",
        updatedUser.password,
      );
      const incorrectPassword = await password.compare(
        "SenhaInvalida",
        updatedUser.password,
      );

      expect(correctPassword).toBe(true);
      expect(incorrectPassword).toBe(false);
    });

    test("With unique 'email'", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: "uniqueEmail1@teste.com",
          username: "uniqueEmail1",
          password: "senha@123",
        } as NewUserRequest),
      });

      const patchResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail1",
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

      const updatedUser = await patchResponse.json();

      expect(patchResponse.status).toBe(200);
      expect(updatedUser).toEqual({
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        email: "newEmail@teste.com",
        username: "uniqueEmail1",
        id: updatedUser.id,
        password: updatedUser.password,
      } satisfies User);

      const correctPassword = await password.compare(
        "senha@123",
        updatedUser.password,
      );
      const incorrectPassword = await password.compare(
        "SenhaInvalida",
        updatedUser.password,
      );

      expect(correctPassword).toBe(true);
      expect(incorrectPassword).toBe(false);
    });

    test("With new password", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: "newPassword@teste.com",
          username: "newPassword",
          password: "senha@123",
        } as NewUserRequest),
      });

      const patchResponse: Response = await fetch(
        "http://localhost:3000/api/v1/users/newPassword",
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
      expect(updatedUser).toEqual({
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        email: "newPassword@teste.com",
        username: "newPassword",
        id: updatedUser.id,
        password: updatedUser.password,
      } satisfies User);

      const correctPassword = await password.compare(
        "novaSenha",
        updatedUser.password,
      );
      const incorrectPassword = await password.compare(
        "SenhaInvalida",
        updatedUser.password,
      );

      expect(correctPassword).toBe(true);
      expect(incorrectPassword).toBe(false);
    });
  });
});
