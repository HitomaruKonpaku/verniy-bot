/* eslint-disable quotes */
import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, IsNull, Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { TwitterSpace } from '../../model/twitter-space.entity'
import { TwitterUserService } from './twitter-user.service'

@Injectable()
export class TwitterSpaceService extends BaseEntityService<TwitterSpace> {
  constructor(
    @InjectRepository(TwitterSpace)
    public readonly repository: Repository<TwitterSpace>,
    @Inject(TwitterUserService)
    public readonly twitterUserService: TwitterUserService,
  ) {
    super()
  }

  public async getAllActive() {
    const spaces = await this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .addOrderBy('RANDOM()')
      .getMany()
    return spaces
  }

  public async getOneById(
    id: string,
    options?: {
      withCreator?: boolean
      withHosts?: boolean
      withSpeakers?: boolean
    },
  ) {
    const query = this.repository
      .createQueryBuilder('s')
      .andWhere('s.id = :id', { id })
    if (options?.withCreator) {
      query.leftJoinAndMapOne(
        's.creator',
        'twitter_user',
        'u',
        'u.id = s.creator_id',
      )
    }
    if (options?.withHosts) {
      query.leftJoinAndMapMany(
        's.hosts',
        'twitter_user',
        'u_h',
        'u_h.id IN (SELECT tmp.value FROM json_each(s.host_ids) AS tmp)',
      )
    }
    if (options?.withSpeakers) {
      query.leftJoinAndMapMany(
        's.speakers',
        'twitter_user',
        'u_s',
        'u_s.id IN (SELECT tmp.value FROM json_each(s.speaker_ids) AS tmp)',
      )
    }
    const space = await query.getOne()
    return space
  }

  public async getRawOneById(id: string) {
    const space = await this.repository
      .createQueryBuilder('s')
      .select('s.*')
      .andWhere('s.id = :id', { id })
      .getRawOne()
    return space
  }

  public async getLiveSpaceIds(): Promise<string[]> {
    const query = `
SELECT id
FROM twitter_space
WHERE is_active = TRUE
  AND (
    state = 'live'
    OR (
      state = 'scheduled'
      AND strftime('%s', 'now') * 1000 >= scheduled_start
    )
  )
    `
    const spaces = await this.repository.query(query)
    const ids = spaces.map((v) => v.id)
    return ids
  }

  public async getManyForActiveCheck(options?: { limit?: number }) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      // .andWhere(new Brackets((qb0) => {
      //   qb0
      //     .orWhere(new Brackets((qb1) => {
      //       qb1
      //         .andWhere(`DATETIME ('now', '-25 day') >= DATETIME (created_at / 1000, 'unixepoch')`)
      //         .andWhere(`DATETIME ('now', '-35 day') <= DATETIME (created_at / 1000, 'unixepoch')`)
      //     }))
      //     .orWhere(`strftime ('%w', DATETIME ('now')) = strftime ('%w', DATETIME (created_at / 1000, 'unixepoch'))`)
      // }))
      .addOrderBy('modified_at', 'ASC', 'NULLS FIRST')
      .addOrderBy('created_at')

    if (Number.isSafeInteger(options?.limit)) {
      query.limit(options.limit)
    }

    const spaces = await query.getMany()
    return spaces
  }

  public async getManyForPlaylistCheck(options?: { limit?: number }) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('playlist_url NOTNULL')
      .andWhere(new Brackets((qb) => {
        qb
          .orWhere('playlist_active ISNULL')
          .orWhere('playlist_active = TRUE')
      }))
      // .andWhere(new Brackets((qb0) => {
      //   qb0
      //     .orWhere(new Brackets((qb1) => {
      //       qb1
      //         .andWhere(`DATETIME ('now', '-30 day') >= DATETIME (created_at / 1000, 'unixepoch')`)
      //         .andWhere(`DATETIME ('now', '-35 day') <= DATETIME (created_at / 1000, 'unixepoch')`)
      //     }))
      //     .orWhere(`strftime ('%w', DATETIME ('now')) = strftime ('%w', DATETIME (created_at / 1000, 'unixepoch'))`)
      // }))
      .addOrderBy('playlist_updated_at', 'ASC', 'NULLS FIRST')
      .addOrderBy('created_at')

    if (Number.isSafeInteger(options?.limit)) {
      query.limit(options.limit)
    }

    const spaces = await query.getMany()
    return spaces
  }

  public async getUnknownUserIds(): Promise<string[]> {
    const query = `
WITH twitter_space_user AS (
  SELECT creator_id AS id
  FROM twitter_space
  UNION
  SELECT s2.value
  FROM twitter_space AS s1
    JOIN json_each(
      (
        SELECT host_ids
        FROM twitter_space
        WHERE id = s1.id
      )
    ) AS s2
  UNION
  SELECT s2.value
  FROM twitter_space AS s1
    JOIN json_each(
      (
        SELECT speaker_ids
        FROM twitter_space
        WHERE id = s1.id
      )
    ) AS s2
)
SELECT su.id
FROM twitter_space_user AS su
  LEFT JOIN twitter_user AS u ON u.id = su.id
WHERE u.id ISNULL
  AND su.id NOT IN(
    '1261213933089652738',
    '1483475471169818625'
  )
ORDER BY CAST(su.id AS NUMBER)
    `
    const records = await this.repository.query(query)
    const ids = records.map((v) => v.id)
    return ids
  }

  public async patchPlaylistUrl(id: string, playlistUrl: string) {
    const result = await this.repository.update(
      { id, playlistUrl: IsNull() },
      { playlistUrl },
    )
    return result
  }

  public async updatePlaylistInfo(id: string, playlistUrl: string, playlistActive: boolean) {
    await this.repository.update(
      { id, playlistUrl },
      { playlistActive, playlistUpdatedAt: Date.now() },
    )
  }
}
