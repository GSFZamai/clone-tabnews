import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST api/v1/session", () => {
  describe("Anonymous user", () => {
    test("With incorrect email and correct password", async () => {
      await orchestrator.createUser({
        password: "correct-password",
      });

      const response = await fetch("http://localhost:3000/api/v1/session", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: "invalid-email@teste.com.br",
          password: "correct-password",
        }),
      });

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Falha na autenticação.",
        action: "Verifique as credenciais e tente novamente.",
        status_code: 401,
      });
    });

    test("With correct email and incorrect password", async () => {
      await orchestrator.createUser({
        email: "email_correto@teste.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/session", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: "email_correto@teste.com",
          password: "incorrect-password",
        }),
      });

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Falha na autenticação.",
        action: "Verifique as credenciais e tente novamente.",
        status_code: 401,
      });
    });

    test("With incorrect email and incorrect password", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/session", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: "email_incorreto@teste.com",
          password: "incorrect-password",
        }),
      });

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Falha na autenticação.",
        action: "Verifique as credenciais e tente novamente.",
        status_code: 401,
      });
    });
  });
});
