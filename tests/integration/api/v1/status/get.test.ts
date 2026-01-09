import { StatusResponse } from "pages/api/v1/status";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET api/v1/status", () => {
  describe("Anonymous user", () => {
    it("Should retrieve the current server status", async () => {
      let response: Response = await fetch(
        "http://localhost:3000/api/v1/status",
      );
      let responseBody: StatusResponse = await response.json();

      let parsedDate = new Date(responseBody.updated_at).toISOString();

      expect(response.status).toBe(200);
      expect(responseBody.dependencies.database.version).toEqual("16.0");
      expect(responseBody.dependencies.database.max_connections).toBe(100);
      expect(responseBody.dependencies.database.opened_connections).toBe(1);
      expect(parsedDate).toEqual(responseBody.updated_at);
    });
  });
});
