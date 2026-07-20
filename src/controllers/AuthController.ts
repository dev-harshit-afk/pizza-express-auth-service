import type { Request, Response } from "express";

export class AuthController {
  register(req: Request, res: Response) {
    res.status(200).json({ message: "User registered successfully" });
  }
}
