# Verniy

Discord bot with mainly KanColle related commands.

## Usage

1. Install [Node](https://nodejs.org/en/)
2. Install dependencies using `npm i`
3. Set up `.env` file. See [Configuration](#Configuration) for more detail
4. Start the bot using `npm start`

## Configuration

Create `.env` file in root folder & paste all below config

* APP_ERROR_EMAIL_ENABLE = ""
* APP_OWNER_EMAIL_ADDRESS = ""
* APP_SYSTEM_EMAIL_ADDRESS = ""
* APP_SYSTEM_EMAIL_PASSWORD = ""
* APP_NOTIFICATION_DISCORD_WEBHOOK = ""
* DISCORD_TOKEN = ""
* DISCORD_OWNERS = ""
* DISCORD_PREFIX = ""
* TWITTER_ENABLE = ""
* TWITTER_TWEET_ENABLE = ""
* TWITTER_PROFILE_ENABLE = ""
* TWITTER_CONSUMER_KEY = ""
* TWITTER_CONSUMER_SECRET = ""
* TWITTER_ACCESS_TOKEN = ""
* TWITTER_ACCESS_TOKEN_SECRET = ""
* CRON_ENABLE = ""

Discord token can be found [HERE](https://discordapp.com/developers/applications).

Twitter key & token can be found [HERE](https://developer.twitter.com/en/apps).
For more detail read [Authentication](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens).

Update `src/config.js` if necessary
