import { Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../logger'

@Injectable()
export class TwitCastingApiPublicService {
  private readonly logger = baseLogger.child({ context: TwitCastingApiPublicService.name })
}
