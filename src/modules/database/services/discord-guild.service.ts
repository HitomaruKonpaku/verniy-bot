import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { logger as baseLogger } from '../../../logger'
import { DiscordGuild } from '../models/discord-guild'

export class DiscordGuildService {
  private readonly logger = baseLogger.child({ context: DiscordGuildService.name })

  constructor(
    @InjectRepository(DiscordGuild)
    private readonly repository: Repository<DiscordGuild>,
  ) { }

  public async update(data: DiscordGuild): Promise<DiscordGuild> {
    if (!data) return null
    try {
      const guild = await this.repository.save(data)
      return guild
    } catch (error) {
      this.logger.error(`update: ${error.message}`, data)
    }
    return null
  }
}
