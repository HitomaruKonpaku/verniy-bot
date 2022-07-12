import { Inject, Injectable } from '@nestjs/common'
import { CronJob } from 'cron'
import { CRON_TIME_ZONE } from '../../../../constants/cron.constant'
import { baseLogger } from '../../../../logger'
import { TwitCastingMovieControllerService } from '../controller/twitcasting-movie-controller.service'
import { TwitCastingMovieService } from '../data/twitcasting-movie.service'

@Injectable()
export class TwitCastingMovieCronService {
  private readonly logger = baseLogger.child({ context: TwitCastingMovieCronService.name })

  private readonly CRON_TIME = '0 */5 * * * *'

  private cronJob: CronJob

  constructor(
    @Inject(TwitCastingMovieService)
    private readonly twitCastingMovieService: TwitCastingMovieService,
    @Inject(TwitCastingMovieControllerService)
    private readonly twitCastingMovieControllerService: TwitCastingMovieControllerService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    this.initCron()
    this.cronJob.start()
  }

  private initCron() {
    this.cronJob = new CronJob(
      this.CRON_TIME,
      () => this.onTick(),
      null,
      false,
      CRON_TIME_ZONE,
    )
  }

  private async onTick() {
    await this.checkMovies()
  }

  public async checkMovies() {
    this.logger.debug('--> checkMovies')
    try {
      const movies = await this.twitCastingMovieService.getManyLive()
      await Promise.allSettled(movies.map(async (v) => {
        try {
          await this.twitCastingMovieControllerService.getOneAndSaveById(v.id)
        } catch (error) {
          if (error.response?.status === 404) {
            await this.twitCastingMovieService.updateIsActive(v.id, false)
          }
        }
      }))
    } catch (error) {
      this.logger.error(`checkMovies: ${error.message}`)
    }
    this.logger.debug('<-- checkMovies')
  }
}
