/* eslint-disable no-underscore-dangle */

import { Content, Instruction, Result } from '../interface/twitter-tweet.interface'

export class TwitterTweetUtil {
  public static parseUserTweets(data: any): Result[] {
    const instructions: Instruction[] = data?.user?.result?.timeline_v2?.timeline?.instructions || []
    const results = instructions
      .map((v) => TwitterTweetUtil.parseInstruction(v))
      .flat()
      .filter((v) => v)
    return results
  }

  public static parseUserWithProfileTweets(data: any): Result[] {
    const instructions: Instruction[] = data?.user_result?.result?.timeline_response?.timeline?.instructions || []
    const results = instructions
      .map((v) => TwitterTweetUtil.parseInstruction(v))
      .flat()
      .filter((v) => v)
    return results
  }

  public static parseTweetDetail(data: any): Result[] {
    const instructions: Instruction[] = data?.threaded_conversation_with_injections_v2?.instructions || []
    const results = instructions
      .map((v) => TwitterTweetUtil.parseInstruction(v))
      .flat()
      .filter((v) => v)
    return results
  }

  public static parseInstruction(instruction: Instruction) {
    const type = instruction.__typename || instruction.type
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
    const contents = entries
      .map((v) => v.content)
      .filter((v) => v)
    const results = contents
      .map((v) => TwitterTweetUtil.parseContent(v))
      .flat()
      .filter((v) => v)
    return results
  }

  public static parseContent(content: Content) {
    const type = content.__typename
    switch (type) {
      case 'TimelineTimelineItem':
        return TwitterTweetUtil.parseTimelineTimelineItem(content)
      case 'TimelineTimelineModule':
        return TwitterTweetUtil.parseTimelineTimelineModule(content)
      default:
        return []
    }
  }

  public static parseTimelineTimelineItem(content: Content): Result {
    const result = content.itemContent?.tweet_results?.result || content.content?.tweetResult?.result
    return result
  }

  public static parseTimelineTimelineModule(content: Content): Result[] {
    const results = content.items?.map?.((v) => v.item?.itemContent?.tweet_results?.result || v.item?.content?.tweetResult?.result)
    return results
  }
}
