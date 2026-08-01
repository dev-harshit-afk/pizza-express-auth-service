import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { User } from "../entities/User";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import registerValidator from "../validator.ts/register-validator";
import loginValidator from "../validator.ts/login-validator";
import { CredentialService } from "../services/CredentialService";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entities/RefreshToken";
import authenticate from "../middlewares/authenticate";
import { RequestAuth } from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";

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
router.get(
  "/self",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    authController.self(req as RequestAuth, res, next),
);

router.post(
  "/refresh",
  validateRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.Refresh(req as RequestAuth, res, next),
);

router.post(
  "/logout",
  authenticate,
  parseRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req as RequestAuth, res, next),
);
export default router;
