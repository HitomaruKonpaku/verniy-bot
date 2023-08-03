import { HolodexChannel } from '../model/holodex-channel.entity'

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
}
