import { HolodexVideoType } from '../enum/holodex-video-type.enum'
import { HolodexChannel } from '../model/holodex-channel.entity'
import { HolodexVideo } from '../model/holodex-video.entity'

export class HolodexEntityUtil {
  public static buildChannel(data: any) {
    const obj: HolodexChannel = {
      id: data.id,
      createdAt: 0,
      updatedAt: Date.now(),
      isRetired: data.inactive,
      type: data.type,
      name: data.name,
      org: data.org,
      suborg: data.suborg,
      group: data.group,
    }
    return obj
  }

  public static buildVideo(data: any) {
    const obj: HolodexVideo = {
      id: data.id,
      createdAt: 0,
      updatedAt: Date.now(),
      channelId: data.channel.id,
      type: data.type,
    }
    return obj
  }

  public static buildVideoPlaceholder(data: any) {
    const obj: HolodexVideo = {
      id: data.id,
      createdAt: 0,
      updatedAt: Date.now(),
      channelId: data.channel_id,
      type: HolodexVideoType.PLACEHOLDER,
    }
    return obj
  }
}
