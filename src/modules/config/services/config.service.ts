/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'
import yaml from 'js-yaml'
import { baseLogger } from '../../../logger'
import { holodexConfig } from '../config/holodex.config'
import { instagramConfig } from '../config/instagram.config'
import { tiktokConfig } from '../config/tiktok.config'
import { twitcastingConfig } from '../config/twitcasting.config'
import { twitchConfig } from '../config/twitch.config'
import { twitterConfig } from '../config/twitter.config'

@Injectable()
export class ConfigService {
  public config: Record<string, any>

  private readonly logger = baseLogger.child({ context: ConfigService.name })

  constructor() {
    this.config = {}
    this.reloadConfig()
  }

  public get twitter() {
    return twitterConfig
  }

  public get twitcasting() {
    return twitcastingConfig
  }

  public get twitch() {
    return twitchConfig
  }

  public get instagram() {
    return instagramConfig
  }

  public get tiktok() {
    return tiktokConfig
  }

  public get holodex() {
    return holodexConfig
  }

  public applyConfig() {
    Object.assign(twitterConfig, this.config.twitter || {})
    Object.assign(twitcastingConfig, this.config.twitcasting || {})
    Object.assign(twitchConfig, this.config.twitch || {})
    Object.assign(instagramConfig, this.config.instagram || {})
    Object.assign(tiktokConfig, this.config.tiktok || {})
    Object.assign(holodexConfig, this.config.holodex || {})
  }

  public reloadConfig() {
    this.loadConfig()
    this.applyConfig()
  }

  public loadConfig() {
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
