import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'

@Injectable()
export class TiktokProxyService {
  private readonly logger = baseLogger.child({ context: TiktokProxyService.name })

  /**
   * @see https://github.com/pablouser1/ProxiTok/wiki/Public-instances
   */
  private readonly INSTANCES_URLS = [
    'https://proxitok.herokuapp.com',
    'https://proxitok.pussthecat.org',
    'https://proxitok.privacydev.net',
  ]

  private currentIndex = 2

  public getProxyUrl() {
    return this.INSTANCES_URLS[this.currentIndex]
  }
}
