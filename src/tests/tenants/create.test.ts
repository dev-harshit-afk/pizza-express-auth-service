import type { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../config/data-source";
import { Roles } from "../../constants/index";
import app from "../../app";
import createJWKSMock from "mock-jwks";
import { Tenant } from "../../entities/Tenant";
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

    it("Should update tenant ", async () => {
      const tenantData = {
        name: "tenant name",
        address: "tenant address",
      };

      const tenantRepository = AppDataSource.getRepository(Tenant);

      const tenant = await tenantRepository.save(tenantData);
      const tenantUpdateData = {
        name: "tenant name update",
        address: "tenant address supdate",
      };
      const AdminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });
      // Act
      const api = "/tenants/" + String(tenant.id);
      await request(app)
        .patch(api)
        .set("Cookie", [`accessToken=${AdminToken};`])
        .send(tenantUpdateData);

      // Assert
      const updatedTenant = await tenantRepository.find();
      expect(updatedTenant[0].name).toBe(tenantUpdateData.name);
      expect(updatedTenant[0].address).toBe(tenantUpdateData.address);
    });

    it("tenant list", async () => {
      const tenantData1 = {
        name: "tenant name 1",
        address: "tenant address 1",
      };
      const tenantData2 = {
        name: "tenant name 2",
        address: "tenant address 2",
      };
      const AdminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });
      // Act
      await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${AdminToken};`])
        .send(tenantData1);
      await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${AdminToken};`])
        .send(tenantData2);

      const response = await request(app)
        .get("/tenants/")
        .set("Cookie", [`accessToken=${AdminToken};`]);

      const tenants = await connection.getRepository("Tenant").find();
      // Assert
      expect(response.body?.length).toBe(tenants.length);
    });
    it("should get single tenant by id", async () => {
      const tenantData = {
        name: "tenant name",
        address: "tenant address",
      };

      const AdminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });
      const tenantRepository = AppDataSource.getRepository(Tenant);
      const tenant = await tenantRepository.save(tenantData);
      // Act

      const api = "/tenants/" + String(tenant.id);
      const response = await request(app)
        .get(api)
        .set("Cookie", [`accessToken=${AdminToken};`]);

      // Assert
      expect(response.body?.name).toBe(tenant.name);
      expect(response.body?.address).toBe(tenant.address);
      expect(response.body?.id).toBe(tenant.id);
    });
  });
});
