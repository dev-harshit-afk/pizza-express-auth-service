import type { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../config/data-source";
import app from "../../app";
import { isJWTValid } from "../utils/index";
describe("POST /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //remove data
    await connection.dropDatabase();
    await connection.synchronize();
    await request(app).post("/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password123",
    });
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("when request body is valid", () => {
    it("should send 200 status code", async () => {
      const user = {
        email: "john.doe@example.com",
        password: "password123",
      };
      // Act
      const response = await request(app).post("/auth/login").send(user);
      // Assert
      expect(response.statusCode).toBe(200);
    });
    it("should return 400 for wrong email id", async () => {
      const user = {
        email: "john.do@example.com",
        password: "password123",
      };

      const response = await request(app).post("/auth/login").send(user);

      expect(response.statusCode).toBe(400);
    });
    it("should return 400 for wrong password", async () => {
      const user = {
        email: "john.doe@example.com",
        password: "password",
      };

      const response = await request(app).post("/auth/login").send(user);

      expect(response.statusCode).toBe(400);
    });
    it("should generated valid token for valid email and password", async () => {
      const user = {
        email: "john.doe@example.com",
        password: "password123",
      };

      const response = await request(app).post("/auth/login").send(user);

      let accessTokenCookie = null;
      let refreshTokenCookie = null;

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
  });

  describe("when request body is invalid", () => {
    it("should return 400 for invalid email id", async () => {
      const user = {
        email: "john.do",
        password: "",
      };

      const response = await request(app).post("/auth/login").send(user);

      expect(response.statusCode).toBe(400);
    });
  });
});
