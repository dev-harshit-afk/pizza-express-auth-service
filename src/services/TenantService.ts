import { Repository } from "typeorm";
import { Tenant } from "../entities/Tenant";
import { ITenant } from "../types";

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

  async getAll() {
    return await this.tenantRepository.find();
  }

  async getById(tenantId: number) {
    return await this.tenantRepository.findOne({ where: { id: tenantId } });
  }
  async deleteById(tenantId: number) {
    return await this.tenantRepository.delete(tenantId);
  }
}
