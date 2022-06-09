# verniy-bot

Discord tracking bot

- Twitter
  - User tweet
  - User profile change
  - Spaces
- TwitCasting
- Twitch
- Instagram
- TikTok

## Links

[![discord](https://img.shields.io/badge/invite-verniy--bot-brightgreen?style=for-the-badge&logo=discord&color=5865F2)](https://discord.com/oauth2/authorize?client_id=422330233035948032&permissions=0&scope=bot%20applications.commands)

## Requirements

- [Node.js](https://nodejs.org) (>=14)
- [Discord bot token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
- [Twitter API v2 bearer token](https://developer.twitter.com/en/docs/twitter-api)
- [TwitCasting API cliend id & secret](https://apiv2-doc.twitcasting.tv)
- [Twitch API cliend id & secret](https://dev.twitch.tv/docs/api)
- Instagram session id (optional)

## Commands

- **track_add**
  - twitter_tweet
  - twitter_profile
  - twitter_space
  - twitcasting_live
  - twitch_user_stream
  - tiktok_video

- **track_remove**
  - Same as **track_add**

- **get**
  - twitter
    - user
    - space
  - twitcasting
    - user
    - movie

## Getting Started

```
git clone https://github.com/HitomaruKonpaku/verniy-bot.git
cd verniy-bot
npm install
```

## Usage

1. Clone `config.example.yaml` and rename to `config.yaml`
1. Clone `.env.example` and rename to `.env`
1. Fill out the values in `.env`
1. Run

    ```
    npm start
    ```
