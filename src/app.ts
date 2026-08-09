import "reflect-metadata";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import type { HttpError } from "http-errors";
import logger from "./config/logger";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import tenantRoutes from "./routes/tenant";
import userRoutes from "./routes/user";
import cors from "cors";

const app = express();
app.use(express.static("public", { dotfiles: "allow" }));
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRoutes);
app.use("/tenants", tenantRoutes);
app.use("/users", userRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    errors: [{ type: err.name, msg: err.message, path: "", location: "" }],
  });
});

export default app;
