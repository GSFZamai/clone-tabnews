let response: Response;
let bodyMessage: { message: string };
beforeAll(async () => {
  response = await fetch("http://localhost:3000/api/v1/status");
});

test("make a request to path `api/v1/status` and receives status code 200", async () => {
  expect(response.status).toBe(200);
});

test("make a request to path api/v1/status and receives response message: funcionando!", async () => {
  bodyMessage = await response.json();
  expect(bodyMessage).toHaveProperty("message", "funcionando!");
});
