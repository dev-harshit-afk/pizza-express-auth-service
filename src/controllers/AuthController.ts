import type { Response } from "express";
import type { RegisterUserRequest } from "../types/index.ts";
import { UserService } from "../services/UserService.ts";

export class AuthController {
  userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }
  async register(req: RegisterUserRequest, res: Response) {
    try {
      const { firstName, lastName, email, password } = req.body;
      await this.userService.create({ firstName, lastName, email, password });
      res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
      console.log(error);
    }
  }
}
