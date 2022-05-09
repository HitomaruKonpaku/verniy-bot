import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { logger as baseLogger } from '../../../logger'
import { DiscordUser } from '../models/discord-user'

export class DiscordUserService {
  private readonly logger = baseLogger.child({ context: DiscordUserService.name })

  constructor(
    @InjectRepository(DiscordUser)
    private readonly repository: Repository<DiscordUser>,
  ) { }

  public async update(data: DiscordUser): Promise<DiscordUser> {
    const record = await this.repository.save(data)
    return record
  }
}
