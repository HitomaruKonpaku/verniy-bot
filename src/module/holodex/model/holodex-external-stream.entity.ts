import { Column, Entity, Index, Unique } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { TwitterSpace } from '../../twitter/model/twitter-space.entity'
import { HolodexExternalStreamType } from '../enum/holodex-external-stream-type.enum'
import { HolodexVideo } from './holodex-video.entity'

@Entity('holodex_external_stream')
@Unique(['type', 'sourceId'])
export class HolodexExternalStream extends BaseExternalEntity {
  @Index()
  @Column({ name: 'type', type: 'text' })
  type: HolodexExternalStreamType

  @Column({ name: 'source_id', type: 'text' })
  sourceId: string

  video?: HolodexVideo

  stream?: TwitterSpace
}
