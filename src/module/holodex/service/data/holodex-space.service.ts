/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SpaceState } from '../../../twitter/enum/twitter-space.enum'
import { TwitterSpace } from '../../../twitter/model/twitter-space.entity'
import { HolodexChannelAccountType } from '../../enum/holodex-channel-account-type.enum'
import { HolodexExternalStreamType } from '../../enum/holodex-external-stream-type.enum'
import { HolodexSpace } from '../../interface/holodex-space.interface'

@Injectable()
export class HolodexSpaceService {
  constructor(
    @InjectRepository(TwitterSpace)
    public readonly repository: Repository<TwitterSpace>,
  ) { }

  public async getOneById(id: string): Promise<HolodexSpace> {
    const query = this
      .createQueryBuilder()
      .andWhere('s.is_active = TRUE')
      .andWhere('s.id = :id', { id })
    const space = await query.getOne()
    return space
  }

  public async getManyLive(): Promise<HolodexSpace[]> {
    const query = this
      .createQueryBuilder()
      .andWhere('s.is_active = TRUE')
      .andWhere('s.state = :state', { state: SpaceState.LIVE })
      .andWhere('s.started_at NOTNULL')
      .addOrderBy('s.started_at', 'DESC')
    const spaces = await query.getMany()
    return spaces
  }

  private createQueryBuilder() {
    const query = this.repository
      .createQueryBuilder('s')
      .innerJoinAndMapOne(
        's.creator',
        'twitter_user',
        'u',
        'u.id = s.creator_id',
      )
      .innerJoinAndMapOne(
        's.holodexChannelAccount',
        'holodex_channel_account',
        'hca',
        'hca.account_id = s.creator_id AND hca.account_type = :hcaAccountType',
        { hcaAccountType: HolodexChannelAccountType.TWITTER },
      )
      .leftJoinAndMapOne(
        's.holodexExternalStream',
        'holodex_external_stream',
        'hes',
        'hes.source_id = s.id AND hes.type = :hesType',
        { hesType: HolodexExternalStreamType.TWITTER_SPACE },
      )
    return query
  }
}
