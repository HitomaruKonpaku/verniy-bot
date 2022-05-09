import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { logger as baseLogger } from '../../../logger'
import { DiscordChannel } from '../models/discord-channel'

export class DiscordChannelService {
  private readonly logger = baseLogger.child({ context: DiscordChannelService.name })

  constructor(
    @InjectRepository(DiscordChannel)
    private readonly repository: Repository<DiscordChannel>,
  ) { }

  public async update(data: DiscordChannel): Promise<DiscordChannel> {
    const record = await this.repository.save(data)
    return record
  }
}
