import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitCastingApiMovie, TwitCastingApiMovieInfo } from '../../interfaces/twitcasting-api.interface'
import { TwitCastingMovie } from '../../models/twitcasting-movie.entity'
import { TwitCastingApiService } from '../api/twitcasting-api.service'
import { TwitCastingMovieService } from '../data/twitcasting-movie.service'
import { TwitCastingUserControllerService } from './twitcasting-user-controller.service'

@Injectable()
export class TwitCastingMovieControllerService {
  private readonly logger = baseLogger.child({ context: TwitCastingMovieControllerService.name })

  constructor(
    @Inject(TwitCastingMovieService)
    private readonly twitCastingMovieService: TwitCastingMovieService,
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
    @Inject(TwitCastingApiService)
    private readonly twitCastingApiService: TwitCastingApiService,
  ) { }

  public async getOneAndSaveById(id: string) {
    const response = await this.twitCastingApiService.getMovieById(id)
    const movie = await this.saveMovieInfo(response)
    return movie
  }

  public async getMoviesByUserIds(id: string) {
    const limit = 50
    let offset = 0
    let movies: any[] = []
    do {
      try {
        this.logger.debug('getMoviesByUserIds', { id, limit, offset })
        // eslint-disable-next-line no-await-in-loop
        const response = await this.twitCastingApiService.getMoviesByUserId(id, { limit, offset })
        movies = response.movies
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(movies.map((v) => this.save(v)))
        offset += limit
      } catch (error) {
        this.logger.error(`getMoviesByUserIds: ${error.message}`, { id, limit, offset })
      }
    } while (movies.length)
  }

  /**
   * @see https://apiv2-doc.twitcasting.tv/#get-movie-info
   */
  public async saveMovieInfo(info: TwitCastingApiMovieInfo) {
    const user = await this.twitCastingUserControllerService.save(info.broadcaster)
    const movie = await this.save(info.movie)
    movie.user = user
    return movie
  }

  public async save(data: TwitCastingApiMovie): Promise<TwitCastingMovie> {
    const movie: TwitCastingMovie = {
      id: data.id,
      isActive: true,
      createdAt: data.created,
      userId: data.user_id,
      isLive: data.is_live,
      isRecorded: data.is_recorded,
      isCollabo: data.is_collabo,
      isProtected: data.is_protected,
      title: data.title,
      subtitle: data.subtitle,
      lastOwnerComment: data.last_owner_comment,
      category: data.category,
      largeThumbnail: data.large_thumbnail,
      smallThumbnail: data.small_thumbnail,
      duration: data.duration,
    }
    await this.twitCastingMovieService.save(movie)
    return movie
  }
}
