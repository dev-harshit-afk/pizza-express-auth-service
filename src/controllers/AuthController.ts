/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from "fs";
import type { Response, NextFunction } from "express";
import type { RegisterUserRequest } from "../types/index.ts";
import { UserService } from "../services/UserService.ts";
import type { Logger } from "winston";
import { validationResult } from "express-validator";
import { sign, type JwtPayload } from "jsonwebtoken";
import path from "path/win32";
import createHttpError from "http-errors";
import { Config } from "../config/index.ts";
import { AppDataSource } from "../config/data-source.ts";
import { RefreshToken } from "../entities/RefreshToken.ts";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}
  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body;

      const errResult = validationResult(req);

      if (!errResult.isEmpty()) {
        return res.status(400).json({ errors: errResult.array() });
      }

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
      let privateKey: Buffer | string;
      try {
        privateKey = fs.readFileSync(
          path.join(__dirname, "../../certs/private.pem"),
        );
      } catch (error) {
        const err = createHttpError(500, "Error while reading private key");
        next(err);
        return;
      }

      const payload: JwtPayload = {
        sub: userSavedData.id.toString(),
        role: userSavedData.role,
      };

      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
      const newRefreshToken = await refreshTokenRepo.save({
        user: userSavedData,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      const accessToken = sign(payload, privateKey, {
        expiresIn: "1h",
        algorithm: "RS256",
        issuer: "auth-service",
      });
      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "auth-service",
        jwtid: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
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
