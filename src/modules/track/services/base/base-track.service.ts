import { Repository } from 'typeorm'

export abstract class BaseTrackService<T> {
  public readonly repository: Repository<T>

  public async getDiscordChannelIds() {
    const records = await this.repository
      .createQueryBuilder()
      .select('discord_channel_id')
      .distinct()
      .getRawMany()
    const ids = records.map((v) => v.discord_channel_id) as string[]
    return ids
  }
}
