import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { DiscordGuild } from '../../models/discord-guild.entity'

@Injectable()
export class DiscordGuildService extends BaseEntityService<DiscordGuild> {
  constructor(
    @InjectRepository(DiscordGuild)
    public readonly repository: Repository<DiscordGuild>,
  ) {
    super()
  }

  public async updateLeftAt(id: string) {
    await this.repository.update(
      { id },
      { leftAt: Date.now() },
    )
  }
}