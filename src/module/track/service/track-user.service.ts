import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackUser } from '../model/track-user.entity'

@Injectable()
export class TrackUserService {
  constructor(
    @InjectRepository(TrackUser)
    public readonly repository: Repository<TrackUser>,
  ) { }
}
