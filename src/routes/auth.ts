import express from "express";
import { AuthController } from "../controllers/AuthController.ts";
import { UserService } from "../services/UserService.ts";
import { User } from "../entities/User.ts";
import { AppDataSource } from "../config/data-source.ts";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

router.post("/register", (req, res) => authController.register(req, res));

export default router;
