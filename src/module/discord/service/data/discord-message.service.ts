import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { DiscordMessage } from '../../model/discord-message.entity'

@Injectable()
export class DiscordMessageService extends BaseEntityService<DiscordMessage> {
  constructor(
    @InjectRepository(DiscordMessage)
    public readonly repository: Repository<DiscordMessage>,
  ) {
    super()
  }
}
