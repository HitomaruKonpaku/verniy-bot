import { Column, Entity, Index } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { HolodexVideoType } from '../enum/holodex-video-type.enum'
import { HolodexChannel } from './holodex-channel.entity'
import { HolodexExternalStream } from './holodex-external-stream.entity'

@Entity('holodex_video')
export class HolodexVideo extends BaseExternalEntity {
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Index()
  @Column({ name: 'type', type: 'text' })
  type: HolodexVideoType

  channel?: HolodexChannel

  externalStream?: HolodexExternalStream
}
