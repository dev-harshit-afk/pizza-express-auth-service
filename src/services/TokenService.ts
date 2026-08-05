import type { Repository } from "typeorm";
import { RefreshToken } from "../entities/RefreshToken";
import type { User } from "../entities/User";
import { Config } from "../config/index";
import jwt, { type JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";

export class TokenService {
  constructor(private refreshTokenRepo: Repository<RefreshToken>) {}

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
    return await this.refreshTokenRepo.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });
  }

  generateRefreshToken(payload: JwtPayload) {
    return jwt.sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(payload.id),
    });
  }

  generateAccessToken(payload: JwtPayload) {
    let privateKey: string;

    if (!Config.PRIVATE_KEY) {
      const err = createHttpError(
        500,
        "Private key is not defined in environment variables",
      );
      throw err;
    }
    try {
      privateKey = Config.PRIVATE_KEY!;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      const err = createHttpError(
        500,
        "Error while reading private key from environment variables",
      );
      throw err;
    }

    return jwt.sign(payload, privateKey, {
      expiresIn: "1h",
      algorithm: "RS256",
      issuer: "auth-service",
    });
  }
  async deleteRefreshToken(tokenId: number) {
    await this.refreshTokenRepo.delete({ id: tokenId });
  }
}
