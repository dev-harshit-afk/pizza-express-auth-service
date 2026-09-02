import "reflect-metadata";
import express from "express";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import tenantRoutes from "./routes/tenant";
import userRoutes from "./routes/user";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

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

 
app.use(globalErrorHandler);

export default app;
