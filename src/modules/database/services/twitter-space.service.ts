import { InjectRepository } from '@nestjs/typeorm'
import { SpaceV2 } from 'twitter-api-v2'
import { Repository } from 'typeorm'
import { TwitterEntityUtils } from '../../twitter/utils/TwitterEntityUtils'
import { TwitterSpace } from '../models/twitter-space.entity'

export class TwitterSpaceService {
  constructor(
    @InjectRepository(TwitterSpace)
    public readonly repository: Repository<TwitterSpace>,
  ) { }

  public async getOneById(id: string) {
    const space = await this.repository.findOne({ where: { id } })
    return space
  }

  public async getLiveSpaceIds() {
    const spaces = await this.repository.find({ where: { state: 'live' } })
    const ids = spaces.map((v) => v.id)
    return ids
  }

  public async update(data: TwitterSpace): Promise<TwitterSpace> {
    const space = await this.repository.save(data)
    return space
  }

  public async updateBySpaceObject(data: SpaceV2) {
    const space = await this.update(TwitterEntityUtils.buildSpace(data))
    return space
  }
}
