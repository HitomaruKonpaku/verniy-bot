import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitCastingMovieCronService } from './twitcasting-movie-cron.service'
import { TwitCastingUserCronService } from './twitcasting-user-cron.service'

@Injectable()
export class TwitCastingCronService {
  private readonly logger = baseLogger.child({ context: TwitCastingCronService.name })

  constructor(
    @Inject(TwitCastingUserCronService)
    private readonly twitCastingUserCronService: TwitCastingUserCronService,
    @Inject(TwitCastingMovieCronService)
    private readonly twitCastingMovieCronService: TwitCastingMovieCronService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    this.twitCastingUserCronService.start()
    this.twitCastingMovieCronService.start()
  }
}
