import { Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'
import yaml from 'js-yaml'
import { logger as baseLogger } from '../../../logger'
import { TWITTER_STREAM_RULE_LENGTH, TWITTER_STREAM_RULE_LIMIT } from '../../twitter/constants/twitter.constant'

@Injectable()
export class ConfigService {
  public config: Record<string, any>

  private readonly logger = baseLogger.child({ context: ConfigService.name })

  constructor() {
    this.config = {}
    this.load()
  }

  public get twitter() {
    const config = {
      active: false,
      tweet: {
        active: false,
        /**
         * @see https://developer.twitter.com/en/docs/twitter-api/getting-started/about-twitter-api
         */
        ruleLimit: TWITTER_STREAM_RULE_LIMIT,
        /**
         * @see https://developer.twitter.com/en/docs/twitter-api/getting-started/about-twitter-api
         */
        ruleLength: TWITTER_STREAM_RULE_LENGTH,
      },
      profile: {
        active: false,
        interval: 60000,
      },
      space: {
        active: false,
        interval: 60000,
      },
    }
    Object.assign(config, this.config.twitter || {})
    return config
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

  // eslint-disable-next-line class-methods-use-this
  private getNumber(value: string, defaultValue = 0) {
    return Number(value || defaultValue) || defaultValue
  }
}
