import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { History } from '../model/history.entity'

@Injectable()
export class HistoryRepository {
  constructor(
    @InjectRepository(History)
    public readonly repository: Repository<History>,
  ) { }

  public async save(data: Partial<History>) {
    const result = await this.repository.save(data)
    return result
  }
}
