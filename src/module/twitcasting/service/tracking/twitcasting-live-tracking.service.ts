import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { WebSocket } from 'ws'
import { baseLogger } from '../../../../logger'
import { ConfigService } from '../../../config/service/config.service'
import { DiscordService } from '../../../discord/service/discord.service'
import { TrackTwitCastingLiveService } from '../../../track/service/track-twitcasting-live.service'
import { TwitCastingApiMovieInfo } from '../../interface/twitcasting-api.interface'
import { TwitCastingMovie } from '../../model/twitcasting-movie.entity'
import { TwitCastingUtil } from '../../util/twitcasting.util'
import { TwitCastingApiPublicService } from '../api/twitcasting-api-public.service'
import { TwitCastingApiService } from '../api/twitcasting-api.service'
import { TwitCastingMovieControllerService } from '../controller/twitcasting-movie-controller.service'
import { TwitCastingUserControllerService } from '../controller/twitcasting-user-controller.service'
import { TwitCastingMovieService } from '../data/twitcasting-movie.service'
import { TwitCastingUserService } from '../data/twitcasting-user.service'

@Injectable()
export class TwitCastingLiveTrackingService {
  private readonly logger = baseLogger.child({ context: TwitCastingLiveTrackingService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTwitCastingLiveService)
    private readonly trackTwitCastingLiveService: TrackTwitCastingLiveService,
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TwitCastingMovieService)
    private readonly twitCastingMovieService: TwitCastingMovieService,
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
    @Inject(TwitCastingMovieControllerService)
    private readonly twitCastingMovieControllerService: TwitCastingMovieControllerService,
    @Inject(TwitCastingApiService)
    private readonly twitCastingApiService: TwitCastingApiService,
    @Inject(TwitCastingApiPublicService)
    private readonly twitCastingApiPublicService: TwitCastingApiPublicService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    await this.initUsers()
    this.initRealtimeApi()
    this.checkLive()
  }

  private async initUsers() {
    try {
      const userIds = await this.trackTwitCastingLiveService.getUserIdsForInit()
      if (!userIds.length) {
        return
      }
      await Promise.allSettled(userIds.map((v) => this.twitCastingUserControllerService.getOneAndSaveById(v)))
    } catch (error) {
      this.logger.error(`initUsers: ${error.message}`)
    }
  }

  private initRealtimeApi() {
    const url = this.twitCastingApiService.getRealtimeLivesUrl()
    const socket = new WebSocket(url)
    socket.on('error', (error) => this.logger.error(`[WS] error: ${error.message}`))
    socket.on('open', () => this.logger.debug('[WS] open'))
    socket.on('close', () => this.onWsClose())
    socket.on('message', (payload) => this.onWsMessage(String(payload)))
  }

  private onWsClose() {
    this.logger.debug('[WS] close')
    this.initRealtimeApi()
  }

  private onWsMessage(payload: string) {
    this.logger.debug('[WS] message')
    try {
      const obj = JSON.parse(payload)
      if (!obj.movies?.length) {
        return
      }
      this.checkMovieInfoArr(obj.movies)
    } catch (error) {
      this.logger.error(`onWsMessage: ${error.message}`)
    }
  }

  private async checkMovieInfoArr(infoArr: TwitCastingApiMovieInfo[]) {
    if (!infoArr?.length) {
      return
    }
    try {
      const allUserIds = infoArr.map((v) => v.movie.user_id)
      const filterUserIds = await this.trackTwitCastingLiveService.filterExistedUserIds(allUserIds)
      if (!filterUserIds.length) {
        return
      }
      const filterMovieInfoArr = infoArr.filter((v) => filterUserIds.some((uid) => uid.toLowerCase() === v.movie.user_id))
      await Promise.all(filterMovieInfoArr.map((v) => this.updateAndNotifyMovieInfo(v)))
    } catch (error) {
      this.logger.error(`checkMovies: ${error.message}`)
    }
  }

  private async updateAndNotifyMovieInfo(info: TwitCastingApiMovieInfo) {
    try {
      this.logger.debug('updateAndNotifyMovieInfo', {
        movie: { id: info.movie.id },
        user: {
          id: info.broadcaster.id,
          screenId: info.broadcaster.screen_id,
        },
      })
      let movie = await this.twitCastingMovieService.getOneById(info.movie.id)
      if (movie) {
        return
      }
      movie = await this.twitCastingMovieControllerService.saveMovieInfo(info)
      await this.notifyMovie(movie)
    } catch (error) {
      this.logger.error(`updateAndNotifyMovieInfo: ${error.message}`)
    }
  }

  private async checkLive() {
    try {
      const screenIds = await this.trackTwitCastingLiveService.getScreenIdsForLiveCheck()
      this.logger.debug('checkLive', { userCount: screenIds.length })
      await Promise.allSettled(screenIds.map((v) => this.checkUserMovie(v)))
    } catch (error) {
      this.logger.error(`checkLive: ${error.message}`)
    }

    const { interval } = this.configService.twitcasting.live
    setTimeout(() => this.checkLive(), interval)
  }

  private async checkUserMovie(screenId: string) {
    let movie: { id: string, live: boolean }
    try {
      const response = await this.twitCastingApiPublicService.getStreamServer(screenId)
      movie = response?.movie
      if (!movie?.live) {
        return
      }
      await this.updateMovieById(movie.id, screenId)
    } catch (error) {
      this.logger.error(`checkUserMovie: ${error.message}`, { screenId, movie })
    }
  }

  private async updateMovieById(id: string, screenId: string) {
    try {
      const { oldMovie, newMovie } = await this.getMovieData(id, screenId)
      if (oldMovie?.isLive === newMovie?.isLive) {
        return
      }
      if (!oldMovie?.id && newMovie?.id) {
        await this.notifyMovie(newMovie)
      }
    } catch (error) {
      this.logger.error(`checkMovieById: ${error.message}`, { id })
    }
  }

  private async getMovieData(id: string, screenId: string) {
    const createdAt = Math.floor(Date.now() / 1000)
    const oldMovie = await this.twitCastingMovieService.getOneById(id)
    let newMovie: TwitCastingMovie
    try {
      newMovie = await this.twitCastingMovieControllerService.getOneAndSaveById(id)
    } catch (error) {
      // Getting membership movie will always throw error with status code 404
      if (!screenId || error.response?.status !== 404) {
        throw error
      }
      if (!oldMovie) {
        const user = await this.twitCastingUserService.getOneByIdOrScreenId(screenId)
        if (user) {
          this.logger.debug('getMovieData: Saving draft movie', { id, screenId })
          newMovie = await this.twitCastingMovieControllerService.saveDraft(id, createdAt, user.id)
          newMovie.user = user
          this.logger.warn('getMovieData: Using draft movie', { id, screenId })
        }
      }
    }
    return { oldMovie, newMovie }
  }

  private async notifyMovie(movie: TwitCastingMovie) {
    try {
      this.logger.warn(`notifyMovie: ${movie.user.screenId}`, { url: TwitCastingUtil.getUserUrl(movie.user.screenId) })
      const trackItems = await this.getTrackItems(movie)
      if (!trackItems.length) {
        return
      }
      trackItems.forEach((trackItem) => {
        const content = [trackItem.discordMessage]
          .filter((v) => v)
          .join('\n') || null
        const embed = TwitCastingUtil.getEmbed(movie)
        this.discordService.sendToChannel(
          trackItem.discordChannelId,
          { content, embeds: [embed] },
        )
      })
    } catch (error) {
      this.logger.error(`broadcastNewMovie: ${error.message}`, { movie })
    }
  }

  private async getTrackItems(movie: TwitCastingMovie) {
    try {
      const items = await this.trackTwitCastingLiveService.getManyByUserId(movie.userId)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { movie })
    }
    return []
  }
}
