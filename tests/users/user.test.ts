import request from "supertest";
import app from "../../src/app";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entities/User";
import { Roles } from "../../src/constants/index";

//technique below is AAA, Arrange, Act, Assert

describe("Get /auth/self", () => {
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
    it("should return the user data", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: Roles.CUSTOMER,
      };
      const userRepository = connection.getRepository(User);

      const data = await userRepository.save(userData);

      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`]);
      expect(response.body.id).toBe(data.id);
    });
    it("should send status code 200", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: Roles.CUSTOMER,
      };
      const userRepository = connection.getRepository(User);

      const data = await userRepository.save(userData);

      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`]);
      expect(response.statusCode).toBe(200);
    });
  });
});
