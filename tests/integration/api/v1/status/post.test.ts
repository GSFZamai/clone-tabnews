import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST api/v1/status", () => {
  describe("Anonymous user", () => {
    it("Should respond with MethodNotAllowedError", async () => {
      let response: Response = await fetch(
        "http://localhost:3000/api/v1/status",
        {
          method: "POST",
        },
      );

      const responseBody = await response.json();

      expect(response.status).toBe(405);
      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método HTTP não permitido para esse endpoint.",
        action: "Verifique os métodos HTTP permitidos para esse endpoint.",
        status_code: 405,
      });
    });
  });
});
