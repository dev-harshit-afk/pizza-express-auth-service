import type { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../config/data-source";
import { Roles } from "../../constants/index";
import app from "../../app";
import createJWKSMock from "mock-jwks";
describe("POST /tenants", () => {
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
  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("when request body is valid", () => {
    it("should return 201 status code", async () => {
      const tenantData = {
        name: "tenant name",
        address: "tenant address",
      };
      const AdminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });
      // Act
      const response = await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${AdminToken};`])
        .send(tenantData);
      // Assert
      expect(response.statusCode).toBe(201);
    });
    it("should save the tenant in db", async () => {
      const tenantData = {
        name: "tenant name",
        address: "tenant address",
      };
      const AdminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });
      // Act
      await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${AdminToken};`])
        .send(tenantData);
      const tenants = await connection.getRepository("Tenant").find();
      // Assert
      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
      expect(tenants[0].address).toBe(tenantData.address);
    });
    it("should return 401 status code for unauthenticated users", async () => {
      const tenantData = {
        name: "tenant name",
        address: "tenant address",
      };
      // Act
      const response = await request(app).post("/tenants").send(tenantData);
      expect(response.statusCode).toBe(401);
      const tenants = await connection.getRepository("Tenant").find();
      // Assert
      expect(tenants).toHaveLength(0);
    });
    it("should return 403 status code for non-admin users", async () => {
      const tenantData = {
        name: "tenant name",
        address: "tenant address",
      };
      const managertoken = jwks.token({
        sub: "1",
        role: Roles.MANAGER,
      });
      // Act
      const response = await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${managertoken};`])
        .send(tenantData);
      expect(response.statusCode).toBe(403);
      const tenants = await connection.getRepository("Tenant").find();
      // Assert
      expect(tenants).toHaveLength(0);
    });
  });
});
