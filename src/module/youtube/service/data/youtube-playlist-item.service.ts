import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { YoutubePlaylistItem } from '../../model/youtube-playlist-item.entity'

@Injectable()
export class YoutubePlaylistItemService extends BaseEntityService<YoutubePlaylistItem> {
  constructor(
    @InjectRepository(YoutubePlaylistItem)
    public readonly repository: Repository<YoutubePlaylistItem>,
  ) {
    super()
  }
}
