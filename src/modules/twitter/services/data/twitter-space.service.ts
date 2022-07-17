import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { SpaceState } from '../../enums/twitter-space.enum'
import { TwitterSpace } from '../../models/twitter-space.entity'
import { TwitterUserService } from './twitter-user.service'

@Injectable()
export class TwitterSpaceService extends BaseEntityService<TwitterSpace> {
  constructor(
    @InjectRepository(TwitterSpace)
    public readonly repository: Repository<TwitterSpace>,
    @Inject(TwitterUserService)
    public readonly twitterUserService: TwitterUserService,
  ) {
    super()
  }

  public async getOneById(
    id: string,
    options?: {
      withCreator?: boolean
      withHosts?: boolean
      withSpeakers?: boolean
    },
  ) {
    const query = this.repository
      .createQueryBuilder('ts')
      .andWhere('ts.id = :id', { id })
    if (options?.withCreator) {
      query.leftJoinAndMapOne(
        'ts.creator',
        'twitter_user',
        'tu',
        'tu.id = ts.creator_id',
      )
    }
    const space = await query.getOne()
    if (options?.withHosts && space?.hostIds?.length) {
      space.hosts = await this.twitterUserService.getManyByIds(space.hostIds)
    }
    if (options?.withSpeakers && space?.speakerIds?.length) {
      space.speakers = await this.twitterUserService.getManyByIds(space.speakerIds)
    }
    return space
  }

  public async getRawOneById(id: string) {
    const space = await this.repository
      .createQueryBuilder('ts')
      .select('ts.*')
      .andWhere('ts.id = :id', { id })
      .getRawOne()
    return space
  }

  public async getLiveSpaceIds() {
    const spaces = await this.repository.find({ where: { state: SpaceState.LIVE } })
    const ids = spaces.map((v) => v.id)
    return ids
  }

  public async getManyForActiveCheck() {
    const spaces = await this.repository
      .createQueryBuilder()
      // eslint-disable-next-line quotes
      .andWhere(`DATETIME('now', '-30 day') > DATETIME(created_at / 1000, 'unixepoch')`)
      .andWhere('is_active = TRUE')
      .addOrderBy('created_at')
      .getMany()
    return spaces
  }

  public async getManyForPlaylistActiveCheck() {
    const spaces = await this.repository
      .createQueryBuilder()
      // eslint-disable-next-line quotes
      .andWhere(`DATETIME('now', '-30 day') > DATETIME(created_at / 1000, 'unixepoch')`)
      .andWhere('playlist_url NOTNULL')
      .andWhere('(playlist_active ISNULL OR playlist_active = TRUE)')
      .addOrderBy('created_at')
      .getMany()
    return spaces
  }

  public async updatePlaylistActive(id: string, playlistActive: boolean) {
    await this.repository.update({ id }, { playlistActive })
  }
}
