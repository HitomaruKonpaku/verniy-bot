import { TwitterBroadcast } from '../../twitter/model/twitter-broadcast.entity'
import { HolodexChannelAccount } from '../model/holodex-channel_account.entity'
import { HolodexExternalStream } from '../model/holodex-external-stream.entity'

export interface HolodexBroadcast extends TwitterBroadcast {
  holodexChannelAccount?: HolodexChannelAccount
  holodexExternalStream?: HolodexExternalStream
}
