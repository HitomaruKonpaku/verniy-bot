import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackService } from '../base/track.service'
import { TrackInstagramStory } from '../models/track-instagram-story.entity'

@Injectable()
export class TrackInstagramStoryService extends TrackService<TrackInstagramStory> {
  constructor(
    @InjectRepository(TrackInstagramStory)
    public readonly repository: Repository<TrackInstagramStory>,
  ) {
    super()
  }
}
