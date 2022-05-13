import { InjectRepository } from '@nestjs/typeorm'
import { UserV1 } from 'twitter-api-v2'
import { Repository } from 'typeorm'
import { TwitterEntityUtils } from '../../twitter/utils/TwitterEntityUtils'
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

  public async updateByUserObject(data: UserV1) {
    const user = await this.update(TwitterEntityUtils.buildUser(data))
    return user
  }

  public async updateIsActive(id: string, isActive: boolean) {
    const user = await this.repository.findOneByOrFail({ id })
    await this.repository.update({ id }, { isActive })
    Object.assign(user, { isActive })
    return user
  }
}
