A Discord bot written in [Node.js](https://nodejs.org) to be used in private servers. This bot makes use of the official [discord.js](https://github.com/discordjs/discord.js) library to interact with the [Discord API](https://discordapp.com/developers/docs/intro).


## Table of Contents
- [Installation](#installation)
- [Configuring the bot](#configuring-the-bot)
  - [Mandatory configuration settings](#mandatory-configuration-settings)
  - [Optional configuration settings](#optional-configuration-settings)
  - [Changing the avatar](#changing-the-avatar)
- [Running the bot](#running-the-bot)
- [Features](#features)
  - [Welcome Message - Leave Message](#welcome-message---leave-message)
  - [Commands](#commands)
  - [Reaction Role](#reaction-role)
  - [Twitch Livestream Announcements](#twitch-livestream-announcements)


## Installation
**Node.js 10.0.0 or newer is required.**
Download all of the necessary files by cloning the GitHub repository or downloading the ZIP folder. Open the command line in the root folder or use `cd C:\insert\path\to\folder\here\` to navigate there. When arrived, run the `npm install` command. Create a new copy of `config_example.json` and rename it to `config.json` or rename the original `config_example.json` to `config.json`.

## Configuring the bot
If done incorrectly, the bot will not operate the way you want it to or not work at all. Make sure to double-check the adjustments you made before running the bot, it could lead to unintended behaviour otherwise. The correct syntax for the configuration options explained with an example: `"activity": "with Admin perks",`. Do not forget the comma at the end of each line!

### Mandatory configuration settings
Open `config.json` and **make sure to adjust** the following configuration options. The bot will not work otherwise. Therefore, do not leave these options empty, like this `"token": ""`.
- `token` - This is the Discord Bot token you will need to run the bot. Without it, it will not be able to interact with the Discord API. This token can be found by accessing your [Discord Applications](https://discordapp.com/developers/applications/). If no such application has been created yet, read [this guide](https://discordpy.readthedocs.io/en/latest/discord.html) on how to do so.

### Optional configuration settings
The following configuration options are **optional** and do not need to be tweaked for the bot to work. Leave the options empty, like this `"username": ""` if you would like to make use of the defaults.
- `username` [Default is *Lunar*] - Change the username of the bot.
- `activity` [Default is *with Admin perks*] - Change the game that the bot is playing. This activity is always preceded by `Playing ...` where `...` illustrates `activity`.
- `commandPrefix` [Default is *!*] - Change the prefix used to trigger a command.

### Changing the avatar
The avatar can be changed as well. This is done by replacing the `avatar.png` file with an image of choice. The image of choice needs to be a **PNG** file and named `avatar.png`.

## Running the bot
After changing the mandatory configuration options, open the command line and head over to the root folder of the bot. This can be done by using the `cd C:\insert\path\to\folder\here\` command. Once in the root folder, launch the bot by using the `node bot.js` command.

The bot can be shut down by terminating the command line or using the following key-press combination when the command line is focussed `CTRL + C`.

## Features
This bot offers a bunch of features that are all optional. These features can be enabled and disabled individually without affecting another feature. All of these features can be tweaked in the `config.json` file.

### Welcome Message - Leave Message
This feature sends out a message to a Discord channel called `welcome` whenever a user joins/leaves the Discord server.

The following configuration settings affect the behaviour of this feature:
- `enabled` [Default is *false*] - This enables/disables sending out a message on a user joining/leaving the server.
- `welcomeMessageChannelID` [Default is *empty*] - This overrides the default channel to send the message in. Set this setting to a specific channel ID.

### Commands
Lunar supports a select few commands as of now but will be updated to offer a variety of commands for every day use.

The default way to trigger a command is as follows: `![command] [argument]`, where the behaviour of `[argument]` could vary between the different commands. The command prefix can be changed in `config.json`, more information [here](#optional-configuration-settings).

The following command behaviour is currently natively supported:
- `clear/purge/remove/delete [number]` - This will delete as many messages of the past in the current channel with a minimum of *1* and a maximum of up to *99* messages at a time.
- `clear/purge/remove/delete @[user]` - This will delete all messages sent by `[user]` out of the last *99* messages sent in the current channel.

One could even add commands of their own if they possess the means to do so, please do keep in mind that this is not supported code, things could be wonky or not function the way initially envisioned.

### Reaction Role
Reaction role functionality is natively supported through the use of the following data structure in `config.json`, explained with an example:
```JSON
"reactionRole": {
	"enabled": true,
	"messages": {
		"622739516528263168": {
			"👍": [
				"610032704704217092"
			]
		}
	}
}
```

This will add the role with ID `610032704704217092` to the user that reacted with '👍' on the message with ID `622739516528263168` if `enabled` is set to `true`.

If the user removes the '👍' reaction from the message with ID `622739516528263168`, the role with ID `610032704704217092` will be removed from the user.

The following configuration options must be tweaked to make use of this feature:
- `enabled` [Default is *false*] - Enables/disables this specific feature.
- As well as adding the reaction role to the data structure. The template is as follows:
```JSON
"reactionRole": {
	"enabled": true,
	"messages": {
		"[Message ID]": {
			"[Emoji ID/Name]": [
				"[Role ID]",
			],
		},
	}
}
```

This structure allows the case of multiple roles per reaction, multiple reactions per message and multiple messages per server.

For now, each reaction role has to be set up manually. In the near future, a set of commands will be implemented to achieve the same end result with minimal effort.

### Twitch Livestream Announcements
Lunar has built-in support for Twitch livestream announcements by polling the Twitch API every 60 seconds to check whether the specified Twitch channel in `config.json` is currently live.

The following configuration options must be changed in order to make use of this feature:
- `enabled` [Default is *false*] - Enables/disables this feature.
- `client-ID` [Default is *empty*] - Twitch client ID that is needed to make use of the Twitch API. Follow [Step 1: Setup](https://dev.twitch.tv/docs/api#step-1-setup) of the Twitch API documentation to get one.
- `username` [Default is *empty*] - The username of the Twitch channel.
- `announcementChannelID` [Default is *empty*] - The Discord channel to send the livestream announcements in.

Optional configuration options that can be set:
- `announcementMessage` [Default is *empty*] - Message that will be attached to the embed.

In the future, updating of the stream preview thumbnail to the latest snapshot will be added.
