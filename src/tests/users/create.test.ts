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
    it("should update user", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        tenantId: 1,
        role: Roles.CUSTOMER,
      };
      const userRepository = connection.getRepository(User);
      const user = await userRepository.save(userData);

      const adminAccessToken = jwks.token({
        sub: 1,
        role: Roles.ADMIN,
      });
      const updateData = {
        role: Roles.MANAGER,
        firstName: "Jane",
        lastName: "Smith",
      };
      const response = await request(app)
        .patch(`/users/${user.id}`)
        .set("Cookie", [`accessToken=${adminAccessToken};`])
        .send(updateData);
      const updatedUsers = await userRepository.find();
      expect(response.status).toBe(200);
      expect(updatedUsers).toHaveLength(1);
      expect(response.body.id).toBe(user.id);
      expect(updatedUsers[0]?.role).toBe(Roles.MANAGER);
      expect(updatedUsers[0]?.firstName).toBe(updateData.firstName);
      expect(updatedUsers[0]?.lastName).toBe(updateData.lastName);
    });
    it("get user list", async () => {
      const userData1 = {
        firstName: "John 1",
        lastName: "Doe ",
        email: "john.doe@example.com",
        password: "password123",
        tenantId: 1,
        role: Roles.CUSTOMER,
      };
      const userData2 = {
        firstName: "John 2",
        lastName: "Doe ",
        email: "john.doe2@example.com",
        password: "password123",
        tenantId: 1,
        role: Roles.CUSTOMER,
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save(userData1);
      await userRepository.save(userData2);

      const adminAccessToken = jwks.token({
        sub: 1,
        role: Roles.ADMIN,
      });
      const response = await request(app)
        .get("/users")
        .set("Cookie", [`accessToken=${adminAccessToken};`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).not.toHaveProperty("password");
    });
    // it.todo("get single user", async () => {
    //   const userData = {
    //     firstName: "John",
    //     lastName: "Doe",
    //     email: "john.doe@example.com",
    //     password: "password123",
    //     tenantId: 1,
    //   };

    //   const adminAccessToken = jwks.token({
    //     sub: 1,
    //     role: Roles.ADMIN,
    //   });
    //   await request(app)
    //     .post("/users")
    //     .set("Cookie", [`accessToken=${adminAccessToken};`])
    //     .send(userData);

    //   const response = await request(app)
    //     .get(`/users/${userData.email}`)
    //     .set("Cookie", [`accessToken=${adminAccessToken};`]);

    //   expect(response.status).toBe(200);
    //   expect(response.body.email).toBe(userData.email);
    // });
    it("delete user", async () => {
      const userData = {
        firstName: "John 2",
        lastName: "Doe ",
        email: "john.doe2@example.com",
        password: "password123",
        tenantId: 1,
        role: Roles.CUSTOMER,
      };

      const userRepository = connection.getRepository(User);
      const user = await userRepository.save(userData);

      const adminAccessToken = jwks.token({
        sub: 1,
        role: Roles.ADMIN,
      });
      const response = await request(app)
        .delete(`/users/${user.id}`)
        .set("Cookie", [`accessToken=${adminAccessToken};`]);
      const users = await userRepository.find();
      expect(response.status).toBe(200);
      expect(users).toHaveLength(0);
    });
  });
});
