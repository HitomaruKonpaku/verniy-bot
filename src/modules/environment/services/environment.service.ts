import { Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'
import EventEmitter from 'events'
import { baseLogger } from '../../../logger'
import { EnvironmentEvent } from '../enums/environment-event.enum'

@Injectable()
export class EnvironmentService extends EventEmitter {
  private readonly logger = baseLogger.child({ context: EnvironmentService.name })

  public reload() {
    dotenv.config()
    this.logger.warn('environment reloaded')
    this.emit(EnvironmentEvent.RELOAD)
  }
}
