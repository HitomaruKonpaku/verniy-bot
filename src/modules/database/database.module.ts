import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WinstonAdaptor } from 'typeorm-logger-adaptor/logger/winston'
import { logger } from '../../logger'
import { DB_ENTITIES } from './constants/database-entities.constant'
import { DB_DATABASE } from './constants/database.constant'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: DB_DATABASE,
      synchronize: true,
      logger: new WinstonAdaptor(
        logger,
        process.env.NODE_ENV === 'production'
          ? ['schema', 'error', 'warn']
          : 'all',
      ),
      entities: DB_ENTITIES,
    }),
  ],
})
export class DatabaseModule { }
