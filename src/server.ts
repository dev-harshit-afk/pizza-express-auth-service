import app from "./app";
import { AppDataSource } from "./config/data-source";
import { Config } from "./config/index";
import logger from "./config/logger";

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
