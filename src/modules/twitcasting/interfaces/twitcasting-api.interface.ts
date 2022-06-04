export interface TwitCastingApiUser {
  [key: string]: any
}

export interface TwitCastingApiMovie {
  [key: string]: any
}

export interface TwitCastingApiMovieInfo {
  movie: TwitCastingApiMovie
  broadcaster: TwitCastingApiUser
  tags: string[]
}
