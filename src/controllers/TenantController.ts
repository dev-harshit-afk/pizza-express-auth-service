import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
      const { name, address } = req.body;

      const tenant = await this.tenantService.create({ name, address });
      this.logger.info("New tenant has been created", tenant.id);
      res.status(201).json({ id: tenant.id });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
      const { name, address } = req.body;
      const tenantId = req.params.id;
      if (isNaN(Number(tenantId))) {
        next(createHttpError(400, "Invalid tenant id"));
        return;
      }
      const existingTenant = await this.tenantService.findById(
        Number(tenantId),
      );
      if (!existingTenant) {
        next(createHttpError(404, "Tenant not found"));
        return;
      }
      this.logger.debug("Request for updating a tenant", req.body);

      await this.tenantService.update(Number(tenantId), {
        name,
        address,
      });
      res.json({ id: tenantId });
    } catch (error) {
      next(error);
      return;
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.getAll();
      this.logger.info("All tenant have been fetched");
      res.json(tenants);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.params.id;
      if (isNaN(Number(tenantId))) {
        next(createHttpError(400, "Invalid tenant id"));
        return;
      }
      const tenant = await this.tenantService.getById(Number(tenantId));
      if (!tenant) {
        next(createHttpError(404, "Tenant not found"));
        return;
      }
      this.logger.info("Tenant has been fetched", tenant.id);
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }
  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.params.id;
      if (isNaN(Number(tenantId))) {
        next(createHttpError(400, "Invalid tenant id"));
        return;
      }
      const tenant = await this.tenantService.getById(Number(tenantId));
      if (!tenant) {
        next(createHttpError(404, "Tenant not found"));
        return;
      }
      await this.tenantService.deleteById(Number(tenantId));

      this.logger.info("Tenant has been deleted", tenant.id);
      res.json({ message: "Tenant deleted successfully", id: tenant.id });
    } catch (error) {
      next(error);
    }
  }
}
