import { TwitterSpace } from '../../twitter/model/twitter-space.entity'
import { HolodexChannelAccount } from '../model/holodex-channel_account.entity'
import { HolodexExternalStream } from '../model/holodex-external-stream.entity'

export interface HolodexSpace extends TwitterSpace {
  holodexChannelAccount?: HolodexChannelAccount
  holodexExternalStream?: HolodexExternalStream
}
