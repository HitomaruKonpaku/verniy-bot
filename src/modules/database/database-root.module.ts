import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WinstonAdaptor } from 'typeorm-logger-adaptor/logger/winston'
import { logger } from '../../logger'
import { DATABASE_ENTITIES, DATABASE_FILE } from './constants/database.constant'

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
      entities: DATABASE_ENTITIES,
    }),
  ],
})
export class DatabaseRootModule { }
