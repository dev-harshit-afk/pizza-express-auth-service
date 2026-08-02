import request from "supertest";
import app from "../../app";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../constants";
import { User } from "../../entities/User";

//technique below is AAA, Arrange, Act, Assert

describe("POST /users", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    //remove data
    jwks.start();

    await connection.dropDatabase();
    await connection.synchronize();
  });
  afterEach(() => {});

  afterAll(async () => {
    jwks.stop();
    await connection.dropDatabase();
    await connection.synchronize();
    await connection.destroy();
  });
  describe("Given all fields", () => {
    it("should persist user data in database", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        tenantId: 1,
      };

      const adminAccessToken = jwks.token({
        sub: 1,
        role: Roles.ADMIN,
      });
      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminAccessToken};`])
        .send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find({});

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });
    it("should create manager user ", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        tenantId: 1,
      };

      const adminAccessToken = jwks.token({
        sub: 1,
        role: Roles.ADMIN,
      });
      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminAccessToken};`])
        .send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find({});

      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
    });
  });
});
