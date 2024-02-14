import { Inject, Injectable } from '@nestjs/common'
import { History } from '../model/history.entity'
import { HistoryRepository } from '../repository/history.repository'

@Injectable()
export class HistoryService {
  constructor(
    @Inject(HistoryRepository)
    private readonly historyRepository: HistoryRepository,
  ) { }

  public async save(data: Omit<History, 'id' | 'isActive' | 'createdAt'>) {
    const result = await this.historyRepository.save(data)
    return result
  }

  public async saveString(data: Omit<History, 'id' | 'isActive' | 'createdAt' | 'type'>) {
    const result = await this.save({ type: 'string', ...data })
    return result
  }

  public async saveBoolean(data: Omit<History, 'id' | 'isActive' | 'createdAt' | 'type'>) {
    const result = await this.save({ type: 'boolean', ...data })
    return result
  }
}
