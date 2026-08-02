import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { validationResult } from "express-validator";

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const { firstName, lastName, email, password, tenantId, role } = req.body;

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        tenantId,
        role,
      });

      return res.status(200).json({
        message: "User created successfully",
        id: user?.id,
      });
    } catch (err) {
      next(err);
    }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
      const userId = req.params.id;
      const { firstName, lastName, role } = req.body;

      if (isNaN(Number(userId))) {
        next(createHttpError(400, "Invalid user id"));
        return;
      }
      await this.userService.update(Number(userId), {
        firstName,
        lastName,
        role,
      });

      return res.status(200).json({
        message: "User updated successfully",
        id: Number(userId),
      });
    } catch (err) {
      next(err);
    }
  }
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAll();
      return res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      if (isNaN(Number(userId))) {
        next(createHttpError(400, "Invalid user id"));
        return;
      }
      const user = await this.userService.findUserById(Number(userId));
      if (!user) {
        next(createHttpError(404, "User not found"));
        return;
      }
      this.logger.info("User has been fetched", { id: user.id });
      return res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }
  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      if (isNaN(Number(userId))) {
        next(createHttpError(400, "Invalid user id"));
        return;
      }
      const user = await this.userService.findUserById(Number(userId));
      if (!user) {
        next(createHttpError(404, "User not found"));
        return;
      }
      await this.userService.deleteById(Number(userId));

      this.logger.info("User has been deleted", { id: user.id });
      return res.status(200).json({
        message: "User deleted successfully",
        id: Number(user.id),
      });
    } catch (err) {
      next(err);
    }
  }
}
