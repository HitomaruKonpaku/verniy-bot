import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitchUser } from '../../model/twitch-user.entity'
import { TwitchApiService } from '../api/twitch-api.service'
import { TwitchUserControllerService } from './twitch-user-controller.service'

@Injectable()
export class TwitchTeamControllerService {
  private readonly logger = baseLogger.child({ context: TwitchTeamControllerService.name })

  constructor(
    @Inject(TwitchUserControllerService)
    private readonly twitchUserControllerService: TwitchUserControllerService,
    @Inject(TwitchApiService)
    private readonly twitchApiService: TwitchApiService,
  ) { }

  public async getUsers(name: string) {
    const { data } = await this.twitchApiService.getTeamByName(name)
    const chunks: string[][] = data.map((team) => team.users.map((user) => user.user_id))
    const res = await Promise.allSettled(chunks.map((v) => this.twitchUserControllerService.fetchUsersByIds(v)))
    const users = res
      .filter((v) => v.status === 'fulfilled')
      .map((v: any) => v.value)
      .flat() as TwitchUser[]
    return users
  }
}
