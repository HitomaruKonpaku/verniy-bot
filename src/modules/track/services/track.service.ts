import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Track } from '../models/base/track.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackService extends TrackBaseService<Track> {
  constructor(
    @InjectRepository(Track)
    public readonly repository: Repository<Track>,
  ) {
    super()
  }

  public async deactivateByChannelId(channelId: string) {
    await this.repository.update(
      {
        isActive: true,
        discordChannelId: channelId,
      },
      {
        isActive: false,
        updatedAt: Date.now(),
      },
    )
  }
}
