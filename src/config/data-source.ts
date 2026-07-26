import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User.ts";
import { Config } from "./index.ts";
import { RefreshToken } from "../entities/RefreshToken.ts";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST!,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME!,
  password: Config.DB_PASSWORD!,
  database: Config.DB_NAME!,
  //dont use this in production
  synchronize: false,
  logging: false,
  entities: [User, RefreshToken],
  migrations: [],
  subscribers: [],
});
