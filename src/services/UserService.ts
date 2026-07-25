import type { Repository } from "typeorm";
import { User } from "../entities/User.ts";
import type { UserData } from "../types/index.ts";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
    await this.userRepository.save({ firstName, lastName, email, password });
  }
}
