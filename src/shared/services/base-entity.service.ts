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

  public async save(data: T): Promise<T> {
    const result = await this.repository.save(data)
    return result
  }
}
