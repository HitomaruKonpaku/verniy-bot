/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common'
import EventEmitter from 'events'
import { readFileSync } from 'fs'
import yaml from 'js-yaml'
import { baseLogger } from '../../../logger'
import { holodexConfig } from '../config/holodex.config'
import { instagramConfig } from '../config/instagram.config'
import { tiktokConfig } from '../config/tiktok.config'
import { twitcastingConfig } from '../config/twitcasting.config'
import { twitchConfig } from '../config/twitch.config'
import { twitterConfig } from '../config/twitter.config'
import { youtubeConfig } from '../config/youtube.config'
import { ConfigEvent } from '../enums/config-event.enum'

@Injectable()
export class ConfigService extends EventEmitter {
  public config: Record<string, any>

  private readonly logger = baseLogger.child({ context: ConfigService.name })

  constructor() {
    super()
    this.config = {}
    this.reload()
  }

  public get twitter() {
    return twitterConfig
  }

  public get twitcasting() {
    return twitcastingConfig
  }

  public get youtube() {
    return youtubeConfig
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

  public reload() {
    this.load()
    this.apply()
    this.logger.warn('config reloaded')
    this.emit(ConfigEvent.RELOAD)
  }

  public apply() {
    Object.assign(twitterConfig, this.config.twitter || {})
    Object.assign(twitcastingConfig, this.config.twitcasting || {})
    Object.assign(youtubeConfig, this.config.youtube || {})
    Object.assign(twitchConfig, this.config.twitch || {})
    Object.assign(instagramConfig, this.config.instagram || {})
    Object.assign(tiktokConfig, this.config.tiktok || {})
    Object.assign(holodexConfig, this.config.holodex || {})
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
