import { type Repository, type DeepPartial, Brackets } from "typeorm";
import { User } from "../entities/User";
import type { UserData, UserQueryParams } from "../types/index";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const error = createHttpError(400, "User email already exists");
      throw error;
    }
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const userPayload: DeepPartial<User> = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      };

      if (tenantId) {
        userPayload.tenant = { id: tenantId };
      }

      const userData = await this.userRepository.save(userPayload);

      return userData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      const error = createHttpError(500, "Failed to store data in db");
      throw error;
    }
  }

  async findUserByEmailwithPassword(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: {
        password: true,
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
  }

  async findUserById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      relations: { tenant: true },
    });
  }

  async update(
    userId: number,
    userData: { firstName?: string; lastName?: string; role?: string },
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      const error = createHttpError(404, "User not found");
      throw error;
    }

    try {
      return await this.userRepository.update(userId, userData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      const error = createHttpError(500, "Failed to update data in db");
      throw error;
    }
  }
  async getAll(validateQuery: UserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (validateQuery.q) {
      const searchQuery = `%${validateQuery.q}%`;

      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILIKE :q", {
            q: searchQuery,
          }).orWhere("user.email ILIKE :q", { q: searchQuery });
        }),
      );
    }

    if (validateQuery.role) {
      queryBuilder.andWhere("user.role = :role", { role: validateQuery.role });
    }
    const result = await queryBuilder
      .leftJoinAndSelect("user.tenant", "tenant")
      .skip((validateQuery.currentPage - 1) * validateQuery.perPage)
      .take(validateQuery.perPage)
      .orderBy("user.id", "DESC")
      .getManyAndCount();

    return result;
  }

  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
