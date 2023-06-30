/* eslint-disable no-underscore-dangle */

import { Instruction, Result } from '../interface/twitter-tweet.interface'

export class TwitterTweetUtil {
  public static parseUserTweetsAndReplies(data): Result[] {
    const instructions: Instruction[] = data.user?.result?.timeline_v2?.timeline?.instructions || []
    const results = instructions
      .map((v) => TwitterTweetUtil.parseInstruction(v))
      .flat()
      .filter((v) => v)
    return results
  }

  public static parseInstruction(instruction: Instruction) {
    const type = instruction?.type
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
    const result = instruction.entry?.content?.itemContent?.tweet_results?.result
    return result
  }

  public static parseTimelineAddEntriesInstruction(instruction: Instruction): Result[] {
    const entryTypes = [
      'TimelineTimelineItem',
      'TimelineTimelineModule',
    ]
    const entries = instruction.entries || []
    const itemContents = entries
      .map((v) => v.content)
      .filter((v) => entryTypes.includes(v.entryType))
      .map((v) => v.items?.map?.((item) => item.item?.itemContent) || v.itemContent)
      .flat()
      .filter((v) => v) || []
    const results = itemContents
      .map((v) => v.tweet_results?.result)
      .filter((v) => v?.__typename === 'Tweet') || []
    return results
  }
}
