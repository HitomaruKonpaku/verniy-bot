import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { ConfigEvent } from '../../../config/enums/config-event.enum'
import { ConfigService } from '../../../config/services/config.service'

@Injectable()
export class TiktokProxyService {
  private readonly logger = baseLogger.child({ context: TiktokProxyService.name })

  /**
   * @see https://github.com/pablouser1/ProxiTok/wiki/Public-instances
   */
  private readonly INSTANCES_URLS = [
    'https://proxitok.pabloferreiro.es',
    'https://proxitok.pussthecat.org',
    'https://tok.habedieeh.re',
    'https://proxitok.esmailelbob.xyz',
    'https://proxitok.dhusch.de',
    'https://proxitok.privacydev.net',
    'https://proxitok.odyssey346.dev',
    'https://tok.artemislena.eu',
    'https://tok.adminforge.de',
    'https://proxitok.manasiwibi.com',
    'https://tik.hostux.net',
  ]

  private currentIndex = 0

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.addListeners()
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

  private addListeners() {
    this.configService.on(ConfigEvent.RELOAD, () => {
      this.setCurrentIndex(this.configService.tiktok.proxyIndex)
    })
  }
}
