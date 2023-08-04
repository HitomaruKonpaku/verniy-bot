import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { HolodexChannelAccount } from '../../model/holodex-channel_account.entity'

type AddData = Pick<HolodexChannelAccount, 'channelId' | 'accountType' | 'accountId'>

@Injectable()
export class HolodexChannelAccountService extends BaseEntityService<HolodexChannelAccount> {
  constructor(
    @InjectRepository(HolodexChannelAccount)
    public readonly repository: Repository<HolodexChannelAccount>,
  ) {
    super()
  }

  public async add(data: AddData) {
    await this.repository.upsert(
      {
        id: randomUUID(),
        isActive: true,
        createdAt: 0,
        ...data,
      },
      {
        conflictPaths: ['channelId', 'accountType', 'accountId'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
  }
}
