import request from "supertest";
import app from "../../app.ts";

describe("POST /auth/register", () => {
  describe("when the request body is valid", () => {
    it("should send 200 code", async () => {
      const user = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      };
      const response = await request(app).post("/auth/register").send(user);

      expect(response.statusCode).toBe(200);
    });
  });
});
