import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitCastingUser } from '../../models/twitcasting-user.entity'
import { TwitCastingApiService } from '../api/twitcasting-api.service'
import { TwitCastingUserService } from '../data/twitcasting-user.service'

@Injectable()
export class TwitCastingUserControllerService {
  private readonly logger = baseLogger.child({ context: TwitCastingUserControllerService.name })

  constructor(
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TwitCastingApiService)
    private readonly twitCastingApiService: TwitCastingApiService,
  ) { }

  public async getOneAndSaveById(id: string) {
    const response = await this.twitCastingApiService.getUserById(id)
    const user = await this.save(response.user)
    return user
  }

  public async save(data: any): Promise<TwitCastingUser> {
    const user: TwitCastingUser = {
      id: data.id,
      isActive: true,
      createdAt: data.created,
      screenId: data.screen_id,
      name: data.name,
      image: data.image,
      profile: data.profile,
      level: data.level,
      lastMovieId: data.last_movie_id,
      isLive: data.is_live,
    }
    await this.twitCastingUserService.save(user)
    return user
  }
}
