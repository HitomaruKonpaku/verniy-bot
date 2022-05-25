import { Repository } from 'typeorm'

export abstract class BaseEntityService<T> {
  public readonly repository: Repository<T>

  public async getOneById(id: string) {
    const record = await this.repository
      .createQueryBuilder()
      .andWhere('id = :id', { id })
      .getOne()
    return record
  }

  public async save(data: T): Promise<T> {
    const record = await this.repository.save(data)
    return record
  }
}
