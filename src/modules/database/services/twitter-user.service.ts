import { InjectRepository } from '@nestjs/typeorm'
import Twit from 'twit'
import { Repository } from 'typeorm'
import { logger as baseLogger } from '../../../logger'
import { TwitterUtils } from '../../twitter/utils/TwitterUtils'
import { TwitterUser } from '../models/twitter-user'

export class TwitterUserService {
  private readonly logger = baseLogger.child({ context: TwitterUserService.name })

  constructor(
    @InjectRepository(TwitterUser)
    private readonly repository: Repository<TwitterUser>,
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

  public async getManyForTweet() {
    const users = await this.repository
      .createQueryBuilder('tu')
      .innerJoin(
        'twitter_discord_tweet',
        'tdt',
        'LOWER(tdt.twitter_username) = LOWER(tu.username) AND tdt.is_active = TRUE',
      )
      .addOrderBy('tu.username')
      .getMany()
    return users
  }

  public async update(data: TwitterUser): Promise<TwitterUser> {
    if (!data) return null
    try {
      const user = await this.repository.save(data)
      return user
    } catch (error) {
      this.logger.error(`update: ${error.message}`, data)
    }
    return null
  }

  public async updateByTwitterUser(user: Twit.Twitter.User) {
    const twitterUser = await this.update({
      id: user.id_str,
      createdAt: new Date(user.created_at),
      username: user.screen_name,
      name: user.name,
      location: user.location,
      description: TwitterUtils.getUserDescription(user),
      protected: user.protected,
      verified: user.verified,
      profileImageUrl: TwitterUtils.getUserProfileImageUrl(user),
      profileBannerUrl: user.profile_banner_url,
    })
    return twitterUser
  }
}
