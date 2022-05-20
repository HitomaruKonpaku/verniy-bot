import { InjectRepository } from '@nestjs/typeorm'
import { UserV1, UserV2 } from 'twitter-api-v2'
import { Repository } from 'typeorm'
import { TwitterEntityUtils } from '../../twitter/utils/TwitterEntityUtils'
import { TrackTwitterProfile } from '../models/track-twitter-profile.entity'
import { TwitterUser } from '../models/twitter-user.entity'

export class TwitterUserService {
  constructor(
    @InjectRepository(TwitterUser)
    public readonly repository: Repository<TwitterUser>,
  ) { }

  public async getOneById(id: string) {
    const user = await this.repository.findOne({ where: { id } })
    return user
  }

  public async getManyByIds(ids: string[]) {
    const users = await this.repository
      .createQueryBuilder()
      .andWhere('id IN (:...ids)', { ids })
      .getMany()
    return users
  }

  public async getRawOneById(id: string) {
    const user = await this.repository
      .createQueryBuilder('tu')
      .select('tu.*')
      .andWhere('tu.id = :id', { id })
      .getRawOne()
    return user
  }

  public async getOneByUsername(username: string) {
    const user = await this.repository
      .createQueryBuilder()
      .andWhere('LOWER(username) = LOWER(:username)', { username })
      .addOrderBy('is_active', 'DESC')
      .getOne()
    return user
  }

  public async getRawOneByUsername(username: string) {
    const user = await this.repository
      .createQueryBuilder('tu')
      .select('tu.*')
      .andWhere('LOWER(tu.username) = LOWER(:username)', { username })
      .addOrderBy('tu.is_active', 'DESC')
      .getRawOne()
    return user
  }

  public async getAll() {
    const users = await this.repository.find()
    return users
  }

  public async getManyForCheck() {
    const users = await this.repository
      .createQueryBuilder('tu')
      .leftJoin(
        TrackTwitterProfile,
        'ttp',
        'ttp.is_active = TRUE AND ttp.twitter_user_id = tu.id',
      )
      .andWhere('ttp.twitter_user_id ISNULL')
      .getMany()
    return users
  }

  public async update(data: TwitterUser): Promise<TwitterUser> {
    const user = await this.repository.save(data)
    return user
  }

  public async updateByUserObject(data: UserV1) {
    const user = await this.update(TwitterEntityUtils.buildUser(data))
    return user
  }

  public async updateByUserObjectV2(data: UserV2) {
    const user = await this.update(TwitterEntityUtils.buildUserV2(data))
    return user
  }

  public async updateIsActive(id: string, isActive: boolean) {
    const user = await this.repository.findOneByOrFail({ id })
    await this.repository.update({ id }, { isActive })
    Object.assign(user, { isActive })
    return user
  }
}
