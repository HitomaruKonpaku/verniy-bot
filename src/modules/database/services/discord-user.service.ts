import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DiscordUser } from '../models/discord-user.entity'

export class DiscordUserService {
  constructor(
    @InjectRepository(DiscordUser)
    public readonly repository: Repository<DiscordUser>,
  ) { }

  public async update(data: DiscordUser): Promise<DiscordUser> {
    const record = await this.repository.save(data)
    return record
  }
}
