import type { Repository } from "typeorm";
import { User } from "../entities/User.ts";
import type { UserData } from "../types/index.ts";
import createHttpError from "http-errors";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
    try {
      const userData = await this.userRepository.save({
        firstName,
        lastName,
        email,
        password,
      });

      return userData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      const error = createHttpError(500, "Failed to store data in db");
      throw error;
    }
  }
}
