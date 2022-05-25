import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { DiscordUser } from '../../models/discord-user.entity'

@Injectable()
export class DiscordUserService extends BaseEntityService<DiscordUser> {
  constructor(
    public readonly repository: Repository<DiscordUser>,
  ) {
    super()
  }
}
