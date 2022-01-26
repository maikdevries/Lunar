## Prerequisites

1. [DISCORD_TOKEN](https://discord.com/developers/)
2. [TWITCH KEY](https://dev.twitch.tv/docs/api/)
3. [YOUTUBE KEY](https://developers.google.com/youtube/v3/docs)
4. [SPOTIFY KEY](https://developer.spotify.com/)


## How to set up

```
// Copy the .env.example to .env
cp .env.example .env

// Fill the .env file

// Install the packages
npm i package.json

// Launch the bot
node src/bot.js
```

1. `DISCORD_TOKEN` is your bot's token (99.99% of the time the same as the one you used in Orbit)

2. `DISCORD_USERNAME` is the name you would like to have your bot appear as (for Lunar, this is 'Lunar')

3. `DISCORD_ACTIVITY` is the activity you want to have it appear as like 'Playing ...' where '...' is this string (for Lunar, this is empty)

4. `DATABASE_NAME` is the name for the database (same as you used in Orbit, you figured this one out yourself?)

5. `DATABASE_URL` is the URL to your MongoDB database

6. `TWITCH_ID` is the Client ID of your Twitch developer application (check out Twitch developer console)

7. `TWITCH_SECRET` is the corresponding secret

8. `YOUTUBE_KEY` is the API key for the YouTube API (check out Google's developer console)

9. `SPOTIFY_ID` is the Client ID of your Spotify developer application (check out Spotify developer console)

10. `SPOTIFY_SECRET` is the corresponding secret

