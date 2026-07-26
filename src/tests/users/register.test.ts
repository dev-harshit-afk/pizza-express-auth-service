import request from "supertest";
import app from "../../app.ts";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source.ts";
import { User } from "../../entities/User.ts";
import { Roles } from "../../constants/index.ts";
import { isJWTValid } from "../utils/index.ts";
import { RefreshToken } from "../../entities/RefreshToken.ts";

//technique below is AAA, Arrange, Act, Assert

describe("POST /auth/register", () => {
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
  describe("when the request body is valid", () => {
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
    it("should return valid access and refresh token", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: Roles.CUSTOMER,
      };
      let accessTokenCookie = null;
      let refreshTokenCookie = null;

      const response = await request(app).post("/auth/register").send(userData);

      interface Headers {
        [key: string]: string | string[] | undefined;
        ["set-cookie"]: string[];
      }

      const headers = response.headers as Headers;

      const cookies = headers["set-cookie"] || [];
      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessTokenCookie = cookie.split(";")[0]?.split("=")[1];
        }
        if (cookie.startsWith("refreshToken=")) {
          refreshTokenCookie = cookie.split(";")[0]?.split("=")[1];
        }
      });

      expect(accessTokenCookie).not.toBeNull();
      expect(refreshTokenCookie).not.toBeNull();

      expect(isJWTValid(accessTokenCookie)).toBe(true);
      expect(isJWTValid(refreshTokenCookie)).toBe(true);
    });
    it("should store the token in db", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: Roles.CUSTOMER,
      };

      const response = await request(app).post("/auth/register").send(userData);
      const refreshTokenRepository = connection.getRepository(RefreshToken);
      const refreshTokens = await refreshTokenRepository.find();
      expect(refreshTokens).toHaveLength(1);
      const tokens = await refreshTokenRepository
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId=:userId", { userId: response.body.data.id })
        .getMany();

      expect(tokens).toHaveLength(1);
    });
  });
  describe("when the request body is invalid", () => {
    it("should return 400 status code if email is missing", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "",
        password: "password123",
      };

      const res = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(res.statusCode).toBe(400);
      expect(users).toHaveLength(0);
    });
    it("should return 400 status code if firstName is missing", async () => {
      const userData = {
        firstName: "",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      };

      const res = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(res.statusCode).toBe(400);
      expect(users).toHaveLength(0);
    });
    it("should return 400 status code if lastName is missing", async () => {
      const userData = {
        firstName: "John",
        lastName: "",
        email: "john.doe@example.com",
        password: "password123",
      };

      const res = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(res.statusCode).toBe(400);
      expect(users).toHaveLength(0);
    });
    it("should return 400 status code if password is missing", async () => {
      const userData = {
        firstName: "John",
        lastName: "",
        email: "john.doe@example.com",
        password: "",
      };

      const res = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(res.statusCode).toBe(400);
      expect(users).toHaveLength(0);
    });
  });
  describe("when the request body has formating issue", () => {
    it("should trim the email", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: " john.doe@example.com   ", // Note the trailing spaces
        password: "password123",
        role: Roles.CUSTOMER,
      };

      await request(app).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();

      expect(user).toHaveLength(1);
      expect(user[0]?.email).toBe("john.doe@example.com");
    });
    it("should return 400 status code if email is not valid", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doeexample.com", // Invalid email format
        password: "password123",
      };
      const res = await request(app).post("/auth/register").send(userData);
      expect(res.statusCode).toBe(400);
    });
    it("should return 400 status code if password lenth is less than 8", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@gmail.com", // Invalid email format
        password: "pass",
      };
      const res = await request(app).post("/auth/register").send(userData);
      expect(res.statusCode).toBe(400);
    });
  });
});
