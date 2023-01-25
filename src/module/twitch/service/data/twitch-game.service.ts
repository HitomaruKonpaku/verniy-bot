import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { TwitchGame } from '../../model/twitch-game.entity'

@Injectable()
export class TwitchGameService extends BaseEntityService<TwitchGame> {
  constructor(
    @InjectRepository(TwitchGame)
    public readonly repository: Repository<TwitchGame>,
  ) {
    super()
  }

  public async saveGame(data: Pick<TwitchGame, 'id' | 'name'>) {
    const game = await this.save({ ...data, isActive: true, createdAt: 0 })
    return game
  }
}
