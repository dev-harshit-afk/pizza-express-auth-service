import { Brackets, Repository } from "typeorm";
import { Tenant } from "../entities/Tenant";
import { ITenant, TenantQueryParams } from "../types";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  async create(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData);
  }

  async update(tenantId: number, tenantData: ITenant) {
    return await this.tenantRepository.update(tenantId, tenantData);
  }
  async findById(tenantId: number) {
    return await this.tenantRepository.findOneBy({ id: tenantId });
  }

  async getAll(validateQuery: TenantQueryParams) {
    const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");

    if (validateQuery.q) {
      const searchQuery = `%${validateQuery.q}%`;

      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(tenant.name, ' ', tenant.address) ILIKE :q", {
            q: searchQuery,
          });
        }),
      );
    }
    const result = await queryBuilder
      .skip((validateQuery.currentPage - 1) * validateQuery.perPage)
      .take(validateQuery.perPage)
      .orderBy("tenant.id", "DESC")
      .getManyAndCount();

    return result;
  }

  async getById(tenantId: number) {
    return await this.tenantRepository.findOne({ where: { id: tenantId } });
  }
  async deleteById(tenantId: number) {
    return await this.tenantRepository.delete(tenantId);
  }
}
