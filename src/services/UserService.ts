import type { Repository } from "typeorm";
import { User } from "../entities/User";
import type { UserData } from "../types/index";
import createHttpError from "http-errors";
import { Roles } from "../constants/index";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const error = createHttpError(400, "User email already exists");
      throw error;
    }
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const userData = await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });

      return userData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      const error = createHttpError(500, "Failed to store data in db");
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findUserById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }
}
