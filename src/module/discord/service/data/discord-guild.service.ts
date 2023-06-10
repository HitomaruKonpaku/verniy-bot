import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { DiscordGuild } from '../../model/discord-guild.entity'

@Injectable()
export class DiscordGuildService extends BaseEntityService<DiscordGuild> {
  constructor(
    @InjectRepository(DiscordGuild)
    public readonly repository: Repository<DiscordGuild>,
  ) {
    super()
  }

  public async getManyForCron() {
    const guilds = await this.repository
      .createQueryBuilder()
      .andWhere('left_at ISNULL')
      .addOrderBy('updated_at', 'ASC', 'NULLS FIRST')
      .limit(100)
      .getMany()
    return guilds
  }

  public async updateLeftAt(id: string) {
    const now = Date.now()
    await this.repository.update(
      { id },
      {
        isActive: false,
        updatedAt: now,
        leftAt: now,
      },
    )
  }
}
