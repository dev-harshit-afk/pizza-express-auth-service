import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { Roles } from "../constants";

export class UserController {
  constructor(private userService: UserService) {}
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body;

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      });

      return res.status(200).json({
        message: "User created successfully",
        id: user.id,
      });
    } catch (err) {
      next(err);
    }
  }
}
