## Prerequisites

1. [DISCORD_TOKEN](https://discord.com/developers/)
2. [TWITCH KEY](https://dev.twitch.tv/docs/api/)
3. [YOUTUBE KEY](https://developers.google.com/youtube/v3/docs)
4. [SPOTIFY KEY](https://developer.spotify.com/)


## How to set up
`DISCORD_TOKEN` is your bot's token (99.99% of the time the same as the one you used in Orbit)

`DISCORD_USERNAME` is the name you would like to have your bot appear as (for Lunar, this is 'Lunar')

`DISCORD_ACTIVITY` is the activity you want to have it appear as like 'Playing ...' where '...' is this string (for Lunar, this is empty)

`DATABASE_NAME` is the name for the database (same as you used in Orbit, you figured this one out yourself?)

`DATABASE_URL` is the URL to your MongoDB database

`TWITCH_ID` is the Client ID of your Twitch developer application (check out Twitch developer console)

`TWITCH_SECRET` is the corresponding secret

`YOUTUBE_KEY` is the API key for the YouTube API (check out Google's developer console)

`SPOTIFY_ID` is the Client ID of your Spotify developer application (check out Spotify developer console)

`SPOTIFY_SECRET` is the corresponding secret


```
// Copy the .env.example to .env
cp .env.example .env

// Fill the .env file

// Install the packages
npm i package.json

// Launch the bot
node src/bot.js
```
