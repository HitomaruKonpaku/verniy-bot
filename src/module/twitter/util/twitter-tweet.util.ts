/* eslint-disable no-underscore-dangle */

import { Instruction, Result } from '../interface/twitter-tweet.interface'

export class TwitterTweetUtil {
  public static parseUserWithProfileTweets(data: any): Result[] {
    const instructions: Instruction[] = data?.user_result?.result?.timeline_response?.timeline.instructions || []
    const results = instructions
      .map((v) => TwitterTweetUtil.parseInstruction(v))
      .flat()
      .filter((v) => v)
    return results
  }

  public static parseInstruction(instruction: Instruction) {
    const type = instruction.__typename
    switch (type) {
      case 'TimelinePinEntry':
        return TwitterTweetUtil.parseTimelinePinEntryInstruction(instruction)
      case 'TimelineAddEntries':
        return TwitterTweetUtil.parseTimelineAddEntriesInstruction(instruction)
      default:
        return []
    }
  }

  public static parseTimelinePinEntryInstruction(instruction: Instruction): Result {
    const result = instruction.entry?.content?.content?.tweetResult?.result
    return result
  }

  public static parseTimelineAddEntriesInstruction(instruction: Instruction): Result[] {
    const entries = instruction.entries || []
    const results = entries
      .map((v) => v.content?.content)
      .filter((v) => v)
      .map((v) => v.tweetResult?.result)
      .filter((v) => v)
    return results
  }
}
