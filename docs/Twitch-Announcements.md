Lunar has built-in support for Twitch livestream announcements by polling the Twitch API every 60 seconds to check whether the specified Twitch channel in `config.json` is currently live. The announcement will have a message, if this is set, with an embed which has the title, game being played, viewer count and thumbnail of the stream together with a direct link to the stream. This embed is updated every 3 minutes with the latest stream statistics and thumbnail, as long as the stream is online. When the stream goes offline, the embed will change to display information about the latest VOD and link to it.

The following configuration options must be changed in order to make use of this feature:
- `enabled` [Default is *false*] - Enables/disables this feature.
- `client-ID` [Default is *empty*] - Twitch client ID that is needed to make use of the Twitch API. Follow [Step 1: Setup](https://dev.twitch.tv/docs/api#step-1-setup) of the Twitch API documentation to get one.
- `client-secret` [Default is *empty*] - Twitch client secret that is needed to generate OAuth tokens and make use of the Twitch API. It can be found on the same page as the `client-ID`.
- `username` [Default is *empty*] - The username of the Twitch channel.
- `announcementChannelID` [Default is *empty*] - An array of Discord channels to send the livestream announcements in - can be either one or multiple channels.

Optional configuration options that can be set:
- `announcementMessage` [Default is *empty*] - Message that will be attached to the embed.
