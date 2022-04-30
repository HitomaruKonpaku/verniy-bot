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
    if (!data) return null
    try {
      const channel = await this.repository.save(data)
      return channel
    } catch (error) {
      this.logger.error(`update: ${error.message}`, data)
    }
    return null
  }
}
