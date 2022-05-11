import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DiscordChannel } from '../models/discord-channel'

export class DiscordChannelService {
  constructor(
    @InjectRepository(DiscordChannel)
    public readonly repository: Repository<DiscordChannel>,
  ) { }

  public async update(data: DiscordChannel): Promise<DiscordChannel> {
    const record = await this.repository.save(data)
    return record
  }
}
