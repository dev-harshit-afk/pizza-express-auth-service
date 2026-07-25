import request from "supertest";
import app from "../../app.ts";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source.ts";
import { truncateTable } from "../utils/index.ts";
import { User } from "../../entities/User.ts";

//technique below is AAA, Arrange, Act, Assert

describe("POST /auth/register", () => {
  describe("when the request body is valid", () => {
    let connection: DataSource;

    beforeAll(async () => {
      connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
      //remove data
      await truncateTable(connection);
    });

    afterAll(async () => {
      await connection.destroy();
    });

    it("should send 200 code", async () => {
      // Arrange
      const user = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      };
      // Act
      const response = await request(app).post("/auth/register").send(user);
      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return json format", async () => {
      const user = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      };
      const response = await request(app).post("/auth/register").send(user);

      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json"),
      );
    });

    it("should persist user  data in database", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      };

      await request(app).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0]?.firstName).toBe(userData.firstName);
      expect(users[0]?.lastName).toBe(userData.lastName);
      expect(users[0]?.email).toBe(userData.email);
    });
    it("should return id of the user", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      };

      const response = await request(app).post("/auth/register").send(userData);
      const { id } = response.body.data;

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(id).toBe(users[0]?.id);
    });
  });
});
