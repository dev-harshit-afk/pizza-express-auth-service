import winston from "winston";
import { Config } from "./index.ts";

const logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    serviceName: "auth-service",
  },
  silent: Config.NODE_ENV === "test",
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      level: "info",
      dirname: "logs",
      filename: "combinelog",
      silent: Config.NODE_ENV === "test",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      level: "error",
      dirname: "logs",
      filename: "errorLog",
      silent: Config.NODE_ENV === "test",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

export default logger;
