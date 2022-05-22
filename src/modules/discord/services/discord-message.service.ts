import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DiscordMessage } from '../models/discord-message.entity'

export class DiscordMessageService {
  constructor(
    @InjectRepository(DiscordMessage)
    public readonly repository: Repository<DiscordMessage>,
  ) { }

  public async update(data: DiscordMessage): Promise<DiscordMessage> {
    const record = await this.repository.save(data)
    return record
  }
}
