import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { TwitCastingMovieControllerService } from '../controller/twitcasting-movie-controller.service'
import { TwitCastingMovieService } from '../data/twitcasting-movie.service'

@Injectable()
export class TwitCastingMovieCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitCastingMovieCronService.name })

  protected cronTime = '0 */5 * * * *'

  constructor(
    @Inject(TwitCastingMovieService)
    private readonly twitCastingMovieService: TwitCastingMovieService,
    @Inject(TwitCastingMovieControllerService)
    private readonly twitCastingMovieControllerService: TwitCastingMovieControllerService,
  ) {
    super()
  }

  protected async onTick() {
    await this.checkMovies()
  }

  private async checkMovies() {
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
