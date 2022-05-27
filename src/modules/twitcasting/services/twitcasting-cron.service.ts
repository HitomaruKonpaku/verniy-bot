/* eslint-disable max-len */
import { Inject, Injectable } from '@nestjs/common'
import { CronJob } from 'cron'
import { CRON_TIME_ZONE } from '../../../constants/cron.constant'
import { logger as baseLogger } from '../../../logger'
import { TwitCastingMovieControllerService } from './controller/twitcasting-movie-controller.service'
import { TwitCastingUserControllerService } from './controller/twitcasting-user-controller.service'
import { TwitCastingMovieService } from './data/twitcasting-movie.service'
import { TwitCastingUserService } from './data/twitcasting-user.service'

@Injectable()
export class TwitCastingCronService {
  private readonly logger = baseLogger.child({ context: TwitCastingCronService.name })

  private userCheckCronJob: CronJob
  private movieCheckCronJob: CronJob

  constructor(
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
    @Inject(TwitCastingMovieService)
    private readonly twitCastingMovieService: TwitCastingMovieService,
    @Inject(TwitCastingMovieControllerService)
    private readonly twitCastingMovieControllerService: TwitCastingMovieControllerService,
  ) {
    const cronTimeZone = CRON_TIME_ZONE
    this.userCheckCronJob = new CronJob('0 0 */3 * * *', () => this.checkUsers(), null, false, cronTimeZone)
    this.movieCheckCronJob = new CronJob('0 */5 * * * *', () => this.checkMovies(), null, false, cronTimeZone)
  }

  public async start() {
    this.logger.info('Starting...')
    this.userCheckCronJob.start()
    this.movieCheckCronJob.start()
  }

  public async checkUsers() {
    this.logger.info('--> checkUsers')
    try {
      const users = await this.twitCastingUserService.getManyActive()
      await Promise.allSettled(users.map((v) => this.twitCastingUserControllerService.getOneAndSaveById(v.id)))
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
    this.logger.info('<-- checkUsers')
  }

  public async checkMovies() {
    this.logger.info('--> checkMovies')
    try {
      const movies = await this.twitCastingMovieService.getManyLive()
      await Promise.allSettled(movies.map((v) => this.twitCastingMovieControllerService.getOneAndSaveById(v.id)))
    } catch (error) {
      this.logger.error(`checkMovies: ${error.message}`)
    }
    this.logger.info('<-- checkMovies')
  }
}
