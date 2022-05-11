import { InjectRepository } from '@nestjs/typeorm'
import { SpaceV2 } from 'twitter-api-v2'
import { Repository } from 'typeorm'
import { TwitterSpace } from '../models/twitter-space'

export class TwitterSpaceService {
  constructor(
    @InjectRepository(TwitterSpace)
    public readonly repository: Repository<TwitterSpace>,
  ) { }

  public async getLiveSpaceIds() {
    const records = await this.repository.find({ where: { state: 'live' } })
    const ids = records.map((v) => v.id)
    return ids
  }

  public async update(data: TwitterSpace): Promise<TwitterSpace> {
    const space = await this.repository.save(data)
    return space
  }

  public async updateByTwitterUser(data: SpaceV2) {
    const space = await this.update({
      id: data.id,
      isActive: true,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      creatorId: data.creator_id,
      state: data.state,
      isTicketed: data.is_ticketed,
      scheduledStart: data.scheduled_start
        ? new Date(data.scheduled_start).getTime()
        : null,
      startedAt: data.started_at
        ? new Date(data.started_at).getTime()
        : null,
      endedAt: data.ended_at
        ? new Date(data.ended_at).getTime()
        : null,
      lang: data.lang || null,
      title: data.title || null,
    })
    return space
  }
}
