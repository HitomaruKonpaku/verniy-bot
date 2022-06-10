import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { ConfigService } from '../../../config/services/config.service'

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

  private currentIndex = 0

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.setCurrentIndex(this.configService.tiktok.proxyIndex)
  }

  public getProxyUrl() {
    return this.INSTANCES_URLS[this.currentIndex]
  }

  public setCurrentIndex(index: number) {
    this.currentIndex = Math.max(0, Math.min(this.INSTANCES_URLS.length - 1, index))
  }

  public switchProxy() {
    this.currentIndex += 1
    if (this.currentIndex >= this.INSTANCES_URLS.length) {
      this.currentIndex = 0
    }
    this.logger.info(`switchProxy: ${this.currentIndex}`)
  }
}
