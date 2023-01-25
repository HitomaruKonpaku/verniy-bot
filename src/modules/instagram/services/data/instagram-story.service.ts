import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { InstagramStory } from '../../models/instagram-story.entity'

@Injectable()
export class InstagramStoryService extends BaseEntityService<InstagramStory> {
  constructor(
    @InjectRepository(InstagramStory)
    public readonly repository: Repository<InstagramStory>,
  ) {
    super()
  }
}
