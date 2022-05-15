import { InjectRepository } from '@nestjs/typeorm'
import { SpaceV2 } from 'twitter-api-v2'
import { Repository } from 'typeorm'
import { TwitterEntityUtils } from '../../twitter/utils/TwitterEntityUtils'
import { TwitterSpace } from '../models/twitter-space.entity'

export class TwitterSpaceService {
  constructor(
    @InjectRepository(TwitterSpace)
    public readonly repository: Repository<TwitterSpace>,
  ) { }

  public async getOneById(id: string) {
    const space = await this.repository.findOne({ where: { id } })
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

  public async getSpacesForActiveCheck() {
    const spaces = await this.repository
      .createQueryBuilder()
      // eslint-disable-next-line quotes
      .andWhere(`DATETIME('now', '-30 day') > DATETIME(created_at / 1000, 'unixepoch')`)
      .andWhere('is_active = TRUE')
      .addOrderBy('created_at')
      .getMany()
    return spaces
  }

  public async getSpacesForPlaylistActiveCheck() {
    const spaces = await this.repository
      .createQueryBuilder()
      // eslint-disable-next-line quotes
      // .andWhere(`DATETIME('now', '-30 day') > DATETIME(created_at / 1000, 'unixepoch')`)
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
