import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { logger as baseLogger } from '../../../logger'
import { TwitCastingUser } from '../models/twitcasting-user.entity'
import { TwitCastingApiService } from './twitcasting-api.service'

@Injectable()
export class TwitCastingUserService {
  private readonly logger = baseLogger.child({ context: TwitCastingUserService.name })

  constructor(
    @InjectRepository(TwitCastingUser)
    public readonly repository: Repository<TwitCastingUser>,
    @Inject(TwitCastingApiService)
    private readonly twitCastingApiService: TwitCastingApiService,
  ) { }

  public async getOneById(id: string) {
    const user = await this.repository
      .createQueryBuilder()
      .andWhere('id = :id', { id })
      .getOne()
    return user
  }

  public async getOneByScreenId(id: string) {
    const user = await this.repository
      .createQueryBuilder()
      .andWhere('LOWER(screen_id) = LOWER(:id)', { id })
      .getOne()
    return user
  }

  public async getOneByIdOrScreenId(id: string) {
    const user = await this.repository
      .createQueryBuilder()
      .andWhere('(id = :id) OR (LOWER(screen_id) = LOWER(:id))', { id })
      .getOne()
    return user
  }

  public async getManyActive() {
    const users = await this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .getMany()
    return users
  }

  public async getOneAndSaveById(id: string) {
    const response = await this.twitCastingApiService.getUserById(id)
    const user = await this.update(response.user)
    return user
  }

  public async update(data: any): Promise<TwitCastingUser> {
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
    await this.repository.save(user)
    return user
  }
}
