import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { logger as baseLogger } from '../../../logger'
import { TwitCastingMovie } from '../models/twitcasting-movie.entity'
import { TwitCastingApiService } from './twitcasting-api.service'
import { TwitCastingUserService } from './twitcasting-user.service'

@Injectable()
export class TwitCastingMovieService {
  private readonly logger = baseLogger.child({ context: TwitCastingMovieService.name })

  constructor(
    @InjectRepository(TwitCastingMovie)
    public readonly repository: Repository<TwitCastingMovie>,
    @Inject(TwitCastingApiService)
    private readonly twitCastingApiService: TwitCastingApiService,
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
  ) { }

  public async getOneById(id: string) {
    const movie = await this.repository
      .createQueryBuilder()
      .andWhere('id = :id', { id })
      .getOne()
    return movie
  }

  public async getOneAndSaveById(id: string) {
    const response = await this.twitCastingApiService.getMovieById(id)
    await this.twitCastingUserService.update(response.broadcaster)
    const movie = await this.update(response.movie)
    return movie
  }

  public async update(data: any): Promise<TwitCastingMovie> {
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
    await this.repository.save(movie)
    return movie
  }
}