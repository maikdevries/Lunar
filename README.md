A Discord bot written in [Node.js](https://nodejs.org) to be used in private servers. This bot makes use of the official [discord.js](https://github.com/discordjs/discord.js) library to interact with the [Discord API](https://discordapp.com/developers/docs/intro).


## Table of Contents
- [Installation](#installation)
- [Configuring the bot](#configuring-the-bot)
  - [Mandatory configuration settings](#mandatory-configuration-settings)
  - [Optional configuration settings](#optional-configuration-settings)
  - [Changing the avatar](#changing-the-avatar)
- [Running the bot](#running-the-bot)
- [Features](#features)
  - [Welcome Message](#welcome-message)
  - [Leave Message](#leave-message)


## Installation
**Node.js 10.0.0 or newer is required.**
Download all of the necessary files by cloning the GitHub repository or downloading the ZIP folder. Open the command line in the root folder or use `cd C:\insert\path\to\folder\here\` to navigate there. When arrived, run the `npm install` command. Create a new copy of `config_example.json` and rename it to `config.json` or rename the original `config_example.json` to `config.json`.

## Configuring the bot
If done incorrectly, the bot will not operate the way you want it to or not work at all. Make sure to double-check the adjustments you made before running the bot, it could lead to unintended behaviour otherwise. The correct syntax for the configuration options explained with an example: `"activity": "with Admin perks",`. Do not forget the comma at the end of each line!

### Mandatory configuration settings
Open `config.json` and **make sure to adjust** the following configuration options, if not, the bot will not work. Therefore, do not leave these options empty, like this `"token": ""`.
- `token` - This is the Discord Bot token you will need to run the bot, without it, it will not be able to interact with the Discord API. This token can be found by accessing your [Discord Applications](https://discordapp.com/developers/applications/). If no such application has been created yet, read [this guide](https://discordpy.readthedocs.io/en/latest/discord.html) on how to do so.

### Optional configuration settings
The following configuration options are **optional** and do not need to be tweaked for the bot to work. Leave the options empty, like this `"username": ""` if you would like to make use of the defaults.
- `username` [Default is *Source*] - Change the username of the bot.
- `activity` [Default is *with Admin perks*] - Change the game that the bot is playing. This activity is always preceded by `Playing ...` where `...` illustrates `activity`.

### Changing the avatar
The bot's avatar can be changed as well. This is done by replacing the `avatar.png` file with an image of choice. The image of choice needs to be a **PNG** file and named `avatar.png`.

## Running the bot
After changing the mandatory configuration options, open the command line and head over to the root folder of the bot. This can be done by using the `cd C:\insert\path\to\folder\here\` command. Once in the root folder, launch the bot by using the `node bot.js` command.

The bot can be shut down by terminating the command line or using the following keypress combination when the command line is focussed `CTRL + C`.

## Features
This bot offers a bunch of features that are all optional. These features can be enabled and disabled individually without affecting another feature. All of these features can be tweaked in the `config.json` file.

### Welcome Message
The 'Welcome Message' feature sends out a message to a Discord channel called `welcome` whenever a new user joins the Discord server.

The following configuration settings affect the behaviour of this feature:
- `welcomeMessageAdd` [Default is *true*] - This enables/disables this specific feature.
- `welcomeMessageChannelName` [Default is *empty*] - This overrides the default channel name to send the welcome message in.
- `welcomeMessageChannelID` [Default is *empty*] - This overrides the default channel to send the welcome message in, this takes priority over the `welcomeMessageChannelName` setting. Set this setting to a specific channel ID. **Only** set this setting if you have a Discord in which there are multiple channels with the same name.

### Leave Message
The 'Leave Message' feature sends out a message to a Discord channel called `welcome` whenever an user leaves the Discord server.

The following configuration settings affect the behaviour of this feature:
- `welcomeMessageAdd` [Default is *true*] - This enables/disables this specific feature.
- `welcomeMessageChannelName` [Default is *empty*] - This overrides the default channel name to send the leave message in.
- `welcomeMessageChannelID` [Default is *empty*] - This overrides the default channel to send the leave message in, this takes priority over the `welcomeMessageChannelName` setting. Set this setting to a specific channel ID. **Only** set this setting if you have a Discord in which there are multiple channels with the same name.
