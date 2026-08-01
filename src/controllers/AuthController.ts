import type { Response, NextFunction } from "express";
import type { RegisterUserRequest, RequestAuth } from "../types/index";
import { UserService } from "../services/UserService";
import type { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import type { CredentialService } from "../services/CredentialService";
import type { TokenService } from "../services/TokenService";
import { JwtPayload } from "jsonwebtoken";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private credentialService: CredentialService,
    private tokenService: TokenService,
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

      const payload: JwtPayload = {
        sub: userSavedData.id.toString(),
        role: userSavedData.role,
      };

      const newRefreshToken =
        await this.tokenService.persistRefreshToken(userSavedData);

      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
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

      res.status(201).json({
        message: "User registered successfully",
        id: 10,
        data: userSavedData,
      });
    } catch (error) {
      next(error);
      return;
    }
  }
  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    try {
      const errResult = validationResult(req);

      if (!errResult.isEmpty()) {
        return res.status(400).json({ errors: errResult.array() });
      }

      const { email, password } = req.body;
      this.logger.debug("New request to login a user", {
        email,
        password: "******",
      });

      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        const err = createHttpError(400, "invalid email or password");
        next(err);
        return;
      }

      const isPasswordVerfied = await this.credentialService.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordVerfied) {
        const err = createHttpError(400, "invalid email or password");
        next(err);
        return;
      }

      const payload: JwtPayload = {
        sub: user.id.toString(),
        role: user.role,
      };
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      const accessToken = this.tokenService.generateAccessToken(payload);

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

      this.logger.info("User has been logged in", { id: user.id });

      res.status(200).json({
        message: "User logged in successfully",
        id: user.id,
      });

      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async self(req: RequestAuth, res: Response, next: NextFunction) {
    const user = await this.userService.findUserById(Number(req.auth.sub));
    if (!user) {
      const err = createHttpError(400, "No user found");
      next(err);
      return;
    }

    res.json({ ...user, password: undefined });
  }

  async Refresh(req: RequestAuth, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub.toString(),
        role: req.auth.role,
      };
      const user = await this.userService.findUserById(Number(req.auth.sub));
      if (!user) {
        const err = createHttpError(400, "User with that token not found");
        next(err);
        return;
      }
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      const accessToken = this.tokenService.generateAccessToken(payload);

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

      this.logger.info("User has refreshed tokens ", { id: user.id });

      res.json({ id: user.id });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: RequestAuth, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      this.logger.info("Refresh Token has been deleted", {
        id: req.auth.id,
      });
      this.logger.info("User has been logged out", {
        id: req.auth.sub,
      });

      res.clearCookie("accessToken", {
        domain: "localhost",
        sameSite: "strict",
        httpOnly: true,
      });
      res.clearCookie("refreshToken", {
        domain: "localhost",
        sameSite: "strict",
        httpOnly: true,
      });
      res.json({});
    } catch (err) {
      next(err);
    }
  }
}
