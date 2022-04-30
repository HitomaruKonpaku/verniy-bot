import { Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'
import yaml from 'js-yaml'
import { logger as baseLogger } from '../../../logger'

@Injectable()
export class ConfigService {
  public config: any

  private readonly logger = baseLogger.child({ context: ConfigService.name })

  constructor() {
    this.config = {}
    this.load()
  }

  public get twitterActive() {
    return !!this.config.twitter?.active
  }

  public get twitterTweetActive() {
    return !!this.config.twitter?.tweet?.active
  }

  public get twitterProfileActive() {
    return !!this.config.twitter?.profile?.active
  }

  public get twitterProfileInterval() {
    return Number(this.config.twitter?.profile?.interval) || 60000
  }

  public load() {
    let config: any

    try {
      const payload = readFileSync('config.yaml', 'utf-8')
      config = Object.assign(config || {}, yaml.load(payload))
    } catch (error) {
      this.logger.warn(`load: ${error.message}`)
    }

    if (!config) {
      try {
        const payload = readFileSync('config.json', 'utf-8')
        config = Object.assign(config || {}, JSON.parse(payload))
      } catch (error) {
        this.logger.warn(`load: ${error.message}`)
      }
    }

    this.config = config || {}
    return this.config
  }
}
