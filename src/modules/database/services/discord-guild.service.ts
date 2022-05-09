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
    const record = await this.repository.save(data)
    return record
  }

  public async updateLeftAt(id: string) {
    await this.repository.update(
      { id },
      { leftAt: new Date() },
    )
  }
}
