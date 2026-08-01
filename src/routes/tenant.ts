import express from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entities/Tenant";
import logger from "../config/logger";
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);
const router = express.Router();

router.post("/", (req, res, next) => tenantController.create(req, res, next));

export default router;
