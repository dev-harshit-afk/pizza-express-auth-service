import app from "./app.ts";
import { AppDataSource } from "./config/data-source.ts";
import { Config } from "./config/index.ts";
import logger from "./config/logger.ts";

const startServer = () => {
  const PORT = Config.PORT;

  try {
    app.listen(PORT, async () => {
      await AppDataSource.initialize();
      logger.info("data base connected successfully");
      logger.info("listening on port", { port: PORT });
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
