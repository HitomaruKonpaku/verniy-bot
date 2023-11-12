/* eslint-disable class-methods-use-this */

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BroadcastState } from '../../../../twitter/enum/twitter-broadcast.enum'
import { TwitterBroadcast } from '../../../../twitter/model/twitter-broadcast.entity'
import { HolodexChannelAccountType } from '../../../enum/holodex-channel-account-type.enum'
import { HolodexExternalStreamType } from '../../../enum/holodex-external-stream-type.enum'
import { HolodexBroadcast } from '../../../interface/holodex-broadcast.interface'

@Injectable()
export class HolodexBroadcastService {
  constructor(
    @InjectRepository(TwitterBroadcast)
    public readonly repository: Repository<TwitterBroadcast>,
  ) { }

  public async getOneById(id: string): Promise<HolodexBroadcast> {
    const query = this
      .createQueryBuilder()
      .andWhere('b.is_active = TRUE')
      .andWhere('b.id = :id', { id })
    const broadcast = await query.getOne()
    return broadcast
  }

  public async getManyLive(): Promise<HolodexBroadcast[]> {
    const query = this
      .createQueryBuilder()
      .andWhere('b.is_active = TRUE')
      .andWhere('b.state = :state', { state: BroadcastState.RUNNING })
      .andWhere('b.started_at NOTNULL')
      .addOrderBy('b.started_at', 'DESC')
    const broadcasts = await query.getMany()
    return broadcasts
  }

  private createQueryBuilder() {
    const query = this.repository
      .createQueryBuilder('b')
      .innerJoinAndMapOne(
        'b.user',
        'twitter_user',
        'u',
        'u.id = b.user_id',
      )
      .innerJoinAndMapOne(
        'b.holodexChannelAccount',
        'holodex_channel_account',
        'hca',
        'hca.account_id = b.user_id AND hca.account_type = :hcaAccountType',
        { hcaAccountType: HolodexChannelAccountType.TWITTER },
      )
      .leftJoinAndMapOne(
        'b.holodexExternalStream',
        'holodex_external_stream',
        'hes',
        'hes.source_id = b.id AND hes.type = :hesType',
        { hesType: HolodexExternalStreamType.TWITTER_BROADCAST },
      )
    return query
  }
}
