import { Injectable } from '@nestjs/common'
import { TwitterApi } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'

@Injectable()
export class TwitterClientService {
  public client: TwitterApi

  private readonly logger = baseLogger.child({ context: TwitterClientService.name })

  constructor() {
    const token = process.env.TWITTER_BEARER_TOKEN
    if (!token) {
      this.logger.error('TWITTER_BEARER_TOKEN not found')
    }
    this.client = new TwitterApi(token)
  }

  public get roClient() {
    return this.client.readOnly
  }

  public get rwClient() {
    return this.client.readWrite
  }
}
