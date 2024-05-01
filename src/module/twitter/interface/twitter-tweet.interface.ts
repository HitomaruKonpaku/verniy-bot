/* eslint-disable camelcase */

export interface Legacy extends Record<string, any> {
  created_at: Date
  user_id_str: string
  lang: string
  full_text: string
}

export interface Result extends Record<string, any> {
  rest_id: string
  legacy: Legacy
  is_translatable: boolean
  tweet?: Result
}

export interface TweetResults extends Record<string, any> {
  result: Result
}

export interface ItemContent extends Record<string, any> {
  itemType: string
  tweetResult?: TweetResults
  tweet_results?: TweetResults
}

export interface ContentItem extends Record<string, any> {
  entryId: string
  item: {
    content?: ItemContent
    itemContent?: ItemContent
  }
}

export interface Content extends Record<string, any> {
  __typename?: string
  entryType?: string
  itemContent?: ItemContent
  content?: ItemContent
  items?: ContentItem[]
}

export interface Entry extends Record<string, any> {
  entryId: string
  sortIndex: string
  content: Content
}

export interface Instruction extends Record<string, any> {
  __typename?: string
  type: string
  entry?: Entry
  entries?: Entry[]
}
