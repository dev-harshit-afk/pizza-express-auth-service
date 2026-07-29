import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { AuthController } from "../controllers/AuthController.ts";
import { UserService } from "../services/UserService.ts";
import { User } from "../entities/User.ts";
import { AppDataSource } from "../config/data-source.ts";
import logger from "../config/logger.ts";
import registerValidator from "../validator.ts/register-validator.ts";
import loginValidator from "../validator.ts/login-validator.ts";
import { CredentialService } from "../services/CredentialService.ts";
import { TokenService } from "../services/TokenService.ts";
import { RefreshToken } from "../entities/RefreshToken.ts";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const credentialService = new CredentialService();
const tokenService = new TokenService(refreshTokenRepo);
const authController = new AuthController(
  userService,
  logger,
  credentialService,
  tokenService,
);

router.post(
  "/register",
  registerValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
);
router.post(
  "/login",
  loginValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next),
);

export default router;
