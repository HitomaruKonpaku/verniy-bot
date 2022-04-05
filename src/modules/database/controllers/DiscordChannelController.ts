import winston from 'winston'
import { logger as baseLogger } from '../../../logger'
import { db } from '../Database'
import { DiscordChannel } from '../models/DiscordChannel'

class DiscordChannelController {
  private logger: winston.Logger

  constructor() {
    this.logger = baseLogger.child({ label: '[DiscordChannelController]' })
  }

  // eslint-disable-next-line class-methods-use-this
  private get repository() {
    return db.connection.getRepository(DiscordChannel)
  }

  public async update(data: {
    id: string,
    createdAt: Date,
    guildId?: string,
    name?: string,
  }): Promise<DiscordChannel> {
    if (!data) return null
    try {
      const channel = await this.repository.save(data)
      return channel
    } catch (error) {
      this.logger.error(`update: ${error.message}`, data)
    }
    return null
  }
}

export const discordChannelController = new DiscordChannelController()
