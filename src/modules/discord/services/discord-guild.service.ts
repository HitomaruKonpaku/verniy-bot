import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DiscordGuild } from '../models/discord-guild.entity'

export class DiscordGuildService {
  constructor(
    @InjectRepository(DiscordGuild)
    public readonly repository: Repository<DiscordGuild>,
  ) { }

  public async update(data: DiscordGuild): Promise<DiscordGuild> {
    const record = await this.repository.save(data)
    return record
  }

  public async updateLeftAt(id: string) {
    await this.repository.update(
      { id },
      { leftAt: Date.now() },
    )
  }
}
