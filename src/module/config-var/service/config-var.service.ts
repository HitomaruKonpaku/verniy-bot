import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { baseLogger } from '../../../logger'
import { ConfigVarType } from '../enum/config-var-type.enum'
import { ConfigVar } from '../model/config-var.entity'
import { ConfigVarUtil } from '../util/config-var.util'

@Injectable()
export class ConfigVarService implements OnModuleInit {
  private readonly logger = baseLogger.child({ context: ConfigVarService.name })

  private readonly configVars: Record<string, boolean | number | string> = {
    TWITTER_TWEET_INTERVAL: 60,
    TWITTER_TWEET_DISCORD_MESSAGE: true,

    TWITTER_PROFILE_INTERVAL: 60,
    TWITTER_PROFILE_DISCORD_MESSAGE: true,

    TWITTER_SPACE_INTERVAL_NEW_FLEETLINE: 60,
    TWITTER_SPACE_INTERVAL_NEW_AVATAR_CONTENT: 60,
    TWITTER_SPACE_INTERVAL_LIVE: 60,
    TWITTER_SPACE_DISCORD_MESSAGE: true,

    TWITTER_CRON_USER_EXPRESSION: '0 */1 * * * *',
    TWITTER_CRON_USER_MAX_CONCURRENT: 1,
    TWITTER_CRON_USER_LIMIT: 20,

    TWITTER_CRON_SPACE_EXPRESSION: '30 */1 * * * *',
    TWITTER_CRON_SPACE_MAX_CONCURRENT: 1,
    TWITTER_CRON_SPACE_LIMIT: 20,

    TWITTER_CRON_SPACE_PLAYLIST_EXPRESSION: '0 */1 * * * *',
    TWITTER_CRON_SPACE_PLAYLIST_MAX_CONCURRENT: 5,
    TWITTER_CRON_SPACE_PLAYLIST_LIMIT: 20,
  }

  constructor(
    @InjectRepository(ConfigVar)
    public readonly repository: Repository<ConfigVar>,
  ) { }

  async onModuleInit() {
    await this.initVars()
    await this.reloadVars()
  }

  public getIds() {
    return Object.keys(this.configVars)
  }

  public getBoolean(id: string) {
    return this.configVars[id] as boolean
  }

  public getNumber(id: string) {
    return this.configVars[id] as number
  }

  public getString(id: string) {
    return this.configVars[id] as string
  }

  public async set(id: string, value: string) {
    const hasId = Object.keys(this.configVars).some((v) => v === id)
    if (!hasId) {
      return
    }

    const currentValue = this.configVars[id]
    if (typeof currentValue === 'boolean') {
      await this.updateOneById(id, ConfigVarUtil.toBoleanString(value !== '0'))
      return
    }

    if (typeof currentValue === 'number') {
      if (!Number.isNaN(Number(value))) {
        await this.updateOneById(id, value)
      }
      return
    }

    await this.updateOneById(id, value)
  }

  public async findOneById(id: string) {
    const configVar = await this.repository.findOneBy({ id })
    return configVar
  }

  public async reloadVars() {
    const items = await this.repository.find()
    items.forEach((item) => {
      if (!['boolean', 'number', 'string'].includes(item.type)) {
        return
      }
      const value = ConfigVarUtil.fromString(item.value, item.type)
      this.configVars[item.id] = value
    })
    this.logger.debug('reloadVars', { ...this.configVars })
  }

  private async initVars() {
    const vars = this.configVars
    const items = Object.keys(vars).reduce((arr, id) => {
      const value = vars[id]
      const type = typeof value
      if (['boolean', 'number', 'string'].includes(type)) {
        arr.push({
          id,
          type: type as ConfigVarType,
          value: ConfigVarUtil.toString(value),
        })
      }
      return arr
    }, [] as ConfigVar[])
    await Promise.allSettled(items.map((v) => this.insertOrIgnore(v)))
  }

  private async insertOrIgnore(data: ConfigVar) {
    await this.repository.createQueryBuilder()
      .insert()
      .values(data)
      .orIgnore()
      .execute()
  }

  private async updateOneById(id: string, value: string) {
    await this.repository.update({ id }, { value })
    await this.reloadVars()
  }
}
