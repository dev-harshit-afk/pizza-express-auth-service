import request from "supertest";
import app from "./app.ts";

describe.skip("APP", () => {
  it("runs a sample test successfully", () => {
    expect(1 + 1).toBe(2);
  });

  it("should return 200 for the / endpoint", async () => {
    const response = await request(app).get("/").send();
    expect(response.status).toBe(200);
  });
});
