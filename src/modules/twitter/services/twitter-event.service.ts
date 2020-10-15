import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter } from 'events'
import * as Twit from 'twit'
import { TwitterEventConstants } from '../constants/twitter-event.constants'

@Injectable()
export class TwitterEventService extends EventEmitter {
  private readonly _logger = new Logger(TwitterEventService.name)

  public attachStreamEvents(stream: Twit.Stream, config) {
    stream
      .on('warning', message => this.onStreamWarning(message))
      .on('error', error => this.onStreamEror(error))
      .on('limit ', message => this.onStreamLimit(message))
      .on('connect', request => this.onStreamConnect(request))
      .on('connected', response => this.onStreamConnected(response))
      .on('reconnect', (request, response, connectInterval) => this.onStreamReconnect(request, response, connectInterval))
      .on('disconnect', message => this.onStreamDisconnect(message))
      .on('tweet', tweet => this.onStreamTweet(tweet, config))
  }

  private onStreamWarning(message: string) {
    this._logger.warn(message)
  }
  private onStreamEror(error: Error) {
    this._logger.error(error.message)
  }

  private onStreamLimit(message: string) {
    const msg = `Limit: ${message}`
    this._logger.warn(msg)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onStreamConnect(request) {
    this._logger.log('Connecting...')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onStreamConnected(response) {
    this._logger.log('Connected!')
  }

  private onStreamReconnect(request, response, connectInterval) {
    const msg = `Reconnect in ${connectInterval}ms`
    this._logger.log(msg)
  }

  private onStreamDisconnect(message: string) {
    const msg = `Disconnect: ${message}`
    this._logger.error(msg)
  }

  private onStreamTweet(tweet: Twit.Twitter.Status, config) {
    this.emit(TwitterEventConstants.TWEET, tweet, config)
  }
}
