# verniy-bot

Discord tracking bot

- [Twitter](https://twitter.com)
  - User tweet
  - User profile change
  - Spaces
- [TwitCasting](https://twitcasting.tv)
- ~~[YouTube](https://youtube.com)~~
- [Twitch](https://www.twitch.tv)
- [pixivFANBOX](https://fanbox.cc)
- ~~Instagram~~ (unstable)
- ~~TikTok~~ (unstable)

## Links

[![discord](https://img.shields.io/badge/invite-verniy--bot-brightgreen?style=for-the-badge&logo=discord&color=5865F2)](https://discord.com/oauth2/authorize?client_id=422330233035948032&permissions=0&scope=bot%20applications.commands)

## Requirements

- [Node.js](https://nodejs.org) (>=14)
- [Discord bot token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
- [Twitter API v2 bearer token](https://developer.twitter.com/en/docs/twitter-api)
- [TwitCasting API cliend id & secret](https://apiv2-doc.twitcasting.tv)
- [Twitch API cliend id & secret](https://dev.twitch.tv/docs/api)
- Instagram session id

## Commands

### config_var

> Bot config (owner only)

- list
- get
- set

### track_add

> Add or update user tracking

- twitter_tweet
- twitter_profile
- twitter_space
- twitcasting_live
- twitch_live
- twitch_chat
- ~~instagram_post~~
- ~~instagram_story~~
- ~~instagram_profile~~
- tiktok_video

### track_remove

> Remove user tracking

- Same as [track_add](#track_add)

### get

- twitter
  - user
  - space
- twitcasting
  - user
  - movie
- twitch
  - user

## Getting Started

```bash
git clone https://github.com/HitomaruKonpaku/verniy-bot.git
cd verniy-bot
npm install
```

## Usage

1. Clone `config.example.yaml` and rename to `config.yaml`
1. Clone `.env.example` and rename to `.env`
1. Fill out the values in `.env`
   - [Create Discord bot](https://discord.com/developers/applications)
   - Twitter token
   - [TwitCasting token](https://twitcasting.tv/developer.php)
1. Invite bot to your server

   ```txt
   https://discord.com/api/oauth2/authorize?client_id=xxxxx&permissions=0&scope=bot%20applications.commands
   ```

1. Build

   ```bash
   npm run build
   ```

1. Deploy slash commands

   ```bash
   npm run deploy-commands
   ```

1. Run

   ```bash
   npm start
   ```

## Usage (docker)

1. Clone `config.example.yaml` and rename to `config.yaml`
1. Clone `.env.example` and rename to `.env`
1. Fill out the values in `.env`
   - [Create Discord bot](https://discord.com/developers/applications)
   - Twitter token
   - [TwitCasting token](https://twitcasting.tv/developer.php)
1. Invite bot to your server

   ```txt
   https://discord.com/api/oauth2/authorize?client_id=xxxxx&permissions=0&scope=bot%20applications.commands
   ```

1. Run

   ```bash
   docker compose up -d
   ```
