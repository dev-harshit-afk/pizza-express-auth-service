import type { DataSource, Repository } from "typeorm";
import { Tenant } from "../../entities/Tenant";

export const truncateTable = async (connection: DataSource) => {
  const entities = connection.entityMetadatas;

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.clear();
  }
};

export const isJWTValid = (token: string | null): boolean => {
  if (!token) {
    return false;
  }
  const parts = token?.split(".") ?? [];
  if (parts.length !== 3) {
    return false;
  }

  try {
    parts.forEach((part) => {
      Buffer.from(part, "base64").toString("utf-8");
    });
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
};

export const createTenant = async (tenantRepository: Repository<Tenant>) => {
  const tenant = await tenantRepository.save({
    name: "Test name",
    address: "Test address",
  });
  return tenant;
};
