import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { Logger } from "winston";

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, address } = req.body;

      const tenant = await this.tenantService.create({ name, address });
      this.logger.info("New tenant has been created", tenant.id);
      res.status(201).json({ id: tenant.id });
    } catch (error) {
      next(error);
    }
  }
}
