import { Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { SpaceV2 } from 'twitter-api-v2'
import { Repository } from 'typeorm'
import { TwitterSpace } from '../../models/twitter-space.entity'
import { TwitterEntityUtils } from '../../utils/twitter-entity.utils'
import { TwitterUserService } from './twitter-user.service'

export class TwitterSpaceService {
  constructor(
    @InjectRepository(TwitterSpace)
    public readonly repository: Repository<TwitterSpace>,
    @Inject(TwitterUserService)
    public readonly twitterUserService: TwitterUserService,
  ) { }

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
    const spaces = await this.repository.find({ where: { state: 'live' } })
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

  public async update(data: TwitterSpace): Promise<TwitterSpace> {
    const space = await this.repository.save(data)
    return space
  }

  public async updateBySpaceObject(data: SpaceV2) {
    const space = await this.update(TwitterEntityUtils.buildSpace(data))
    return space
  }

  public async updateIsActive(id: string, isActive: boolean) {
    await this.repository.update({ id }, { isActive })
  }

  public async updatePlaylistActive(id: string, playlistActive: boolean) {
    await this.repository.update({ id }, { playlistActive })
  }
}
