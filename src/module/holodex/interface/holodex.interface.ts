import { HolodexChannelAccount } from '../model/holodex-channel_account.entity'
import { HolodexExternalStream } from '../model/holodex-external-stream.entity'

export interface HolodexItem {
  holodexChannelAccount?: HolodexChannelAccount
  holodexExternalStream?: HolodexExternalStream
}
