import request from "supertest";
import app from "../../app.ts";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source.ts";
import { User } from "../../entities/User.ts";
import { Roles } from "../../constants/index.ts";

//technique below is AAA, Arrange, Act, Assert

describe("POST /auth/register", () => {
  describe("when the request body is valid", () => {
    let connection: DataSource;

    beforeAll(async () => {
      connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
      //remove data
      await connection.dropDatabase();
      await connection.synchronize();
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
    it("should assign customer role", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      };

      await request(app).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0]?.role).toBe(Roles.CUSTOMER);
    });
    it("should hash the password", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      };

      await request(app).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]?.password).not.toBe(userData.password);
      expect(users[0]?.password).toHaveLength(60);
      expect(users[0]?.password).toMatch(/^\$2b\$.{56}$/); // bcrypt hash format
    });
    it("should return 400 status code if the email already exists", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: Roles.CUSTOMER,
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save(userData);
      const response = await request(app).post("/auth/register").send(userData);
      const users = await userRepository.find();

      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1); // Ensure no new user was created
    });
  });
});
