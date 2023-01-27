import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { YoutubePlaylist } from '../../model/youtube-playlist.entity'

@Injectable()
export class YoutubePlaylistService extends BaseEntityService<YoutubePlaylist> {
  constructor(
    @InjectRepository(YoutubePlaylist)
    public readonly repository: Repository<YoutubePlaylist>,
  ) {
    super()
  }
}
