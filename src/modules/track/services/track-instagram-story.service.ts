import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackInstagramStory } from '../models/track-instagram-story.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackInstagramStoryService extends TrackBaseService<TrackInstagramStory> {
  constructor(
    @InjectRepository(TrackInstagramStory)
    public readonly repository: Repository<TrackInstagramStory>,
  ) {
    super()
  }
}
