import { readFileSync } from 'fs'
import yaml from 'js-yaml'
import winston from 'winston'
import { logger as baseLogger } from '../../logger'

class ConfigManager {
  public config: any

  private logger: winston.Logger

  constructor() {
    this.logger = baseLogger.child({ label: '[ConfigManager]' })
    this.config = {}
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

export const configManager = new ConfigManager()
