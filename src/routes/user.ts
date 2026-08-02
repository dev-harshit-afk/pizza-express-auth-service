import express from "express";

// import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import canAccess from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = express.Router();

router.post("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  userController.create(req, res, next),
);

export default router;
