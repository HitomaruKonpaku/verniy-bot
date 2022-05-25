import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { DiscordChannel } from '../../models/discord-channel.entity'

@Injectable()
export class DiscordChannelService extends BaseEntityService<DiscordChannel> {
  constructor(
    @InjectRepository(DiscordChannel)
    public readonly repository: Repository<DiscordChannel>,
  ) {
    super()
  }
}
