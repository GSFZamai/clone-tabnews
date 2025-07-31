import { StatusResponse } from "pages/api/v1/status";
import orchestrator from "tests/orquestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("Verify status endpoint", () => {
  it("must make a request to path `api/v1/status` and receives status code 200", async () => {
    let response: Response = await fetch("http://localhost:3000/api/v1/status");
    let responseBody: StatusResponse = await response.json();

    let parsedDate = new Date(responseBody.updated_at).toISOString();

    expect(response.status).toBe(200);
    expect(responseBody.dependencies.database.version).toEqual("16.0");
    expect(responseBody.dependencies.database.max_connections).toBe(100);
    expect(responseBody.dependencies.database.opened_connections).toBe(1);
    expect(parsedDate).toEqual(responseBody.updated_at);
  });
});
