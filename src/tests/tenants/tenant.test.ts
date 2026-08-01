import type { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../config/data-source";
import app from "../../app";
describe("POST /auth/login", () => {
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

  describe("when request body is valid", () => {
    it("should return 201 status code", async () => {
      const tenantData = {
        name: "tenant name",
        address: "tenant address",
      };
      // Act
      const response = await request(app).post("/tenants").send(tenantData);
      // Assert
      expect(response.statusCode).toBe(201);
    });
    it("should save the user in db", async () => {
      const tenantData = {
        name: "tenant name",
        address: "tenant address",
      };
      // Act
      await request(app).post("/tenants").send(tenantData);
      const tenants = await connection.getRepository("Tenant").find();
      // Assert
      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
      expect(tenants[0].address).toBe(tenantData.address);
    });
  });
});
