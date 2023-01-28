import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitchApiService } from '../api/twitch-api.service'
import { TwitchUserService } from '../data/twitch-user.service'

@Injectable()
export class TwitchUserControllerService {
  private readonly logger = baseLogger.child({ context: TwitchUserControllerService.name })

  constructor(
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
    @Inject(TwitchApiService)
    private readonly twitchApiService: TwitchApiService,
  ) { }

  public async fetchUsersByIds(userIds: string[]) {
    const { data: users } = await this.twitchApiService.getUsersByUserIds(userIds)
    const twitchUsers = await Promise.all(users.map(async (user) => {
      try {
        const twitchUser = await this.saveUser(user)
        return twitchUser
      } catch (error) {
        this.logger.error(`fetchUsersByIds#saveUser: ${error.message}`, { user })
      }
      return null
    }))
    return twitchUsers
  }

  public async fetchUserByUsername(username: string) {
    const { data: users } = await this.twitchApiService.getUsersByUsernames([username])
    if (!users.length) {
      return null
    }
    const user = await this.saveUser(users[0])
    return user
  }

  public async saveUser(data: any) {
    const user = await this.twitchUserService.save({
      id: data.id,
      isActive: true,
      createdAt: new Date(data.created_at).getTime(),
      username: data.login,
      displayName: data.display_name,
      type: data.type,
      broadcasterType: data.broadcaster_type,
      description: data.description,
      profileImageUrl: data.profile_image_url,
      offlineImageUrl: data.offline_image_url,
    })
    return user
  }
}
