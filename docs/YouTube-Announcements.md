Lunar has support for both YouTube video announcements and YouTube livestream announcements. The settings for these two independent features can be tinkered with individually, but they do share a number of settings. In order to make use of either feature, please set the following configuration settings:

- `APIkey` [Default is *empty*] - YouTube API key that is required to contact the YouTube services. Follow [these steps](https://developers.google.com/youtube/v3/getting-started) to get your YouTube API key, make sure to also enable the YouTube API! Your key will **not** work without explicitly enabling the YouTube API.
- `channel` [Default is *empty*] - The YouTube channel ID you want to send out notifications for.

### YouTube Video Announcements
If this feature is enabled, an announcement is send out every time the YouTube channel being 'watched' uploads a new video. The announcement will consist of a message, if specified, and a modern embed which contains the title, part of the description and thumbnail of the video, together with a link to YouTube.

Please set the following settings to make use of this:
- `enabled` [Default is *false*] - Enables/disables this feature.
- `announcementChannelID` [Default is *empty*] - An array of Discord channels to send the video release announcements in.

Optional settings you can change:
- `announcementMessage` [Default is *empty*] - Message that will be sent along with the embed.

### YouTube Livestream Announcements
If this feature is enabled, every time the channel starts a livestream, an announcement will be sent to a Discord channel. This announcement will have the title of the stream, description, thumbnail and direct link to the stream, bundled into a neat, modern embed. This embed will be tied with an announcement message, if defined.

The following settings are mandatory to make use of this feature:
- `enabled` [Default is *false*] - Enables/disables this feature.
- `announcementChannelID` [Default is *empty*] - An array of Discord channels to send the livestream announcements in.

Optional settings you can change:
- `announcementMessage` [Default is *empty*] - Message that will be sent along with the embed.
