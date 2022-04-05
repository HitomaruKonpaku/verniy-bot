import { createConnection, DataSource } from 'typeorm'
import { WinstonAdaptor } from 'typeorm-logger-adaptor/logger/winston'
import winston from 'winston'
import { DATABASE_FILE } from '../../constants/database.constant'
import { logger as baseLogger } from '../../logger'
import { DiscordChannel } from './models/DiscordChannel'
import { DiscordGuild } from './models/DiscordGuild'
import { TwitterDiscordProfile } from './models/TwitterDiscordProfile'
import { TwitterDiscordTweet } from './models/TwitterDiscordTweet'
import { TwitterUser } from './models/TwitterUser'

class Db {
  public connection: DataSource

  private logger: winston.Logger

  constructor() {
    this.logger = baseLogger.child({ label: '[Db]' })
  }

  public async init() {
    this.connection = await createConnection({
      type: 'sqlite',
      database: DATABASE_FILE,
      entities: [
        TwitterDiscordTweet,
        TwitterDiscordProfile,
        TwitterUser,
        DiscordGuild,
        DiscordChannel,
      ],
      synchronize: true,
      logger: new WinstonAdaptor(
        this.logger,
        process.env.NODE_ENV !== 'production' ? 'all' : ['schema', 'error', 'warn'],
      ),
    })
  }
}

export const db = new Db()
