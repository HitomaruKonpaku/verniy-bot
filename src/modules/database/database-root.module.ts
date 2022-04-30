import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WinstonAdaptor } from 'typeorm-logger-adaptor/logger/winston'
import { logger } from '../../logger'
import { DATABASE_FILE } from './constants/database.constant'
import { DiscordChannel } from './models/discord-channel'
import { DiscordGuild } from './models/discord-guild'
import { DiscordUser } from './models/discord-user'
import { TwitterDiscordProfile } from './models/twitter-discord-profile'
import { TwitterDiscordTweet } from './models/twitter-discord-tweet'
import { TwitterUser } from './models/twitter-user'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: DATABASE_FILE,
      synchronize: true,
      logger: new WinstonAdaptor(
        logger,
        process.env.NODE_ENV !== 'production' ? 'all' : ['schema', 'error', 'warn'],
      ),
      entities: [
        DiscordUser,
        DiscordGuild,
        DiscordChannel,
        TwitterUser,
        TwitterDiscordProfile,
        TwitterDiscordTweet,
      ],
    }),
  ],
})
export class DatabaseRootModule { }
