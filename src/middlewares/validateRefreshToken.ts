import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie } from "../types";
import { Jwt, JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entities/RefreshToken";
import logger from "../config/logger";

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },

  async isRevoked(req: Request, token: Jwt | undefined) {
    try {
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const user = await refreshTokenRepository.findOne({
        where: {
          id: Number((token!.payload as JwtPayload).id),
          user: { id: Number((token!.payload as JwtPayload).sub) },
        },
      });
      return user === null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      logger.error("Error while getting the refresh token", {
        id: (token?.payload as JwtPayload).id,
      });
    }
    return true;
  },
});
