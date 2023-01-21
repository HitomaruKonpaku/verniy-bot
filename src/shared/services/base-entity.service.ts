import { Repository } from 'typeorm'

export abstract class BaseEntityService<T> {
  public readonly repository: Repository<T>

  public async getOneById(id: string) {
    const result = await this.repository
      .createQueryBuilder()
      .andWhere('id = :id', { id })
      .getOne()
    return result
  }

  public async getManyByIds(ids: string[]) {
    const result = await this.repository
      .createQueryBuilder()
      .andWhere('id IN (:...ids)', { ids })
      .getMany()
    return result
  }

  public async getAll() {
    const result = await this.repository
      .createQueryBuilder()
      .getMany()
    return result
  }

  public async save(data: T): Promise<T> {
    const result = await this.repository.save(data)
    return result
  }

  public async saveAll(data: T[]): Promise<T[]> {
    const result = await this.repository.save(data)
    return result
  }

  public async updateIsActive(id: string, isActive: boolean): Promise<void | T> {
    await this.repository.update({ id } as any, { isActive } as any)
  }
}
