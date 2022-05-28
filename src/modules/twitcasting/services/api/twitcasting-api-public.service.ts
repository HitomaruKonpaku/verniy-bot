import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { randomUUID } from 'crypto'
import { baseLogger } from '../../../../logger'
import { twitCastingStreamServerLimiter } from '../../twitcasting.limiter'

@Injectable()
export class TwitCastingApiPublicService {
  private readonly logger = baseLogger.child({ context: TwitCastingApiPublicService.name })

  public async getStreamServer(screenId: string) {
    const requestId = randomUUID()
    const url = `https://twitcasting.tv/streamserver.php?target=${screenId}&mode=client`
    try {
      const { data } = await twitCastingStreamServerLimiter.schedule(async () => {
        this.logger.debug('--> getStreamServer', { requestId, screenId })
        const response = await axios.get(url)
        this.logger.debug('<-- getStreamServer', { requestId, screenId })
        return response
      })
      return data
    } catch (error) {
      this.logger.error(`getStreamServer: ${error.message}`, { requestId, screenId })
      throw error
    }
  }
}
