import { InjectRepository } from '@nestjs/typeorm'
import { UserV1 } from 'twitter-api-v2'
import { Repository } from 'typeorm'
import { TwitterUtils } from '../../twitter/utils/TwitterUtils'
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

  public async getOneByUsername(username: string) {
    const user = await this.repository
      .createQueryBuilder()
      .andWhere('LOWER(username) = LOWER(:username)', { username })
      .getOne()
    return user
  }

  public async getAll() {
    const users = await this.repository.find()
    return users
  }

  public async update(data: TwitterUser): Promise<TwitterUser> {
    const user = await this.repository.save(data)
    return user
  }

  public async updateByTwitterUser(data: UserV1) {
    const user = await this.update({
      id: data.id_str,
      isActive: true,
      createdAt: new Date(data.created_at).getTime(),
      username: data.screen_name,
      name: data.name,
      location: data.location,
      description: TwitterUtils.getUserDescription(data),
      protected: data.protected,
      verified: data.verified,
      profileImageUrl: TwitterUtils.getUserProfileImageUrl(data),
      profileBannerUrl: TwitterUtils.getUserProfileBannerUrl(data),
    })
    return user
  }

  public async updateIsActive(id: string, isActive: boolean) {
    const user = await this.repository.findOneByOrFail({ id })
    await this.repository.update({ id }, { isActive })
    Object.assign(user, { isActive })
    return user
  }
}
