import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { DiscordUser } from '../../model/discord-user.entity'

@Injectable()
export class DiscordUserService extends BaseEntityService<DiscordUser> {
  constructor(
    @InjectRepository(DiscordUser)
    public readonly repository: Repository<DiscordUser>,
  ) {
    super()
  }
}
