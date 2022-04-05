import winston from 'winston'
import { logger as baseLogger } from '../../../logger'
import { db } from '../Database'
import { DiscordGuild } from '../models/DiscordGuild'

class DiscordGuildController {
  private logger: winston.Logger

  constructor() {
    this.logger = baseLogger.child({ label: '[DiscordGuildController]' })
  }

  // eslint-disable-next-line class-methods-use-this
  private get repository() {
    return db.connection.getRepository(DiscordGuild)
  }

  public async update(data: {
    id: string,
    createdAt: Date,
    name: string,
  }): Promise<DiscordGuild> {
    if (!data) return null
    try {
      const guild = await this.repository.save(data)
      return guild
    } catch (error) {
      this.logger.error(`update: ${error.message}`, data)
    }
    return null
  }
}

export const discordGuildController = new DiscordGuildController()
