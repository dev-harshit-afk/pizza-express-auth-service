import type { Response, NextFunction } from "express";
import type { RegisterUserRequest } from "../types/index.ts";
import { UserService } from "../services/UserService.ts";
import type { Logger } from "winston";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}
  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body;
      this.logger.debug("New request to regiester a user", {
        firstName,
        lastName,
        email,
        password: "******",
      });
      const userSavedData = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info("User has been registered", { id: userSavedData.id });

      res.status(200).json({
        message: "User registered successfully",
        id: 10,
        data: userSavedData,
      });
    } catch (error) {
      next(error);
      return;
    }
  }
}
