import { Inject, Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../../logger'
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

  public async saveUser(data: any) {
    const user = await this.twitchUserService.save({
      id: data.id,
      isActive: true,
      createdAt: new Date(data.created_at).getTime(),
      username: data.login,
      displayName: data.display_name,
      type: data.type || null,
      broadcasterType: data.broadcaster_type || null,
      description: data.description || null,
      profileImageUrl: data.profile_image_url || null,
      offlineImageUrl: data.offline_image_url || null,
    })
    return user
  }
}
