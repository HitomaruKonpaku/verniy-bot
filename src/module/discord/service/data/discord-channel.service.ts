import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { DiscordChannel } from '../../model/discord-channel.entity'

@Injectable()
export class DiscordChannelService extends BaseEntityService<DiscordChannel> {
  constructor(
    @InjectRepository(DiscordChannel)
    public readonly repository: Repository<DiscordChannel>,
  ) {
    super()
  }
}
