If done incorrectly, the bot will not operate the way you want it to or not work at all. Make sure to double-check the adjustments you made before running the bot, it could lead to unintended behaviour otherwise. The correct syntax for the configuration options explained with an example: `"activity": "with Admin perks",`. Do not forget the comma at the end of each line!

### Mandatory configuration settings
Open `config.json` and **make sure to adjust** the following configuration options. The bot will not work otherwise. Therefore, do not leave these options empty, like this `"token": ""`.
- `token` - This is the Discord Bot token you will need to run the bot. Without it, it will not be able to interact with the Discord API. This token can be found by accessing your [Discord Applications](https://discordapp.com/developers/applications/). If no such application has been created yet, read [this guide](https://discordpy.readthedocs.io/en/latest/discord.html) on how to do so.

### Optional configuration settings
The following configuration options are **optional** and do not need to be tweaked for the bot to work.
- `username` [Default is *Lunar*] - Change the username of the bot.
- `activity` [Default is *with Admin perks*] - Change the game that the bot is playing. This activity is always preceded by `Playing ...` where `...` illustrates `activity`.
- `commandPrefix` [Default is *!*] - Change the prefix used to trigger a command.

### Changing the avatar
The avatar can be changed as well. This is done by replacing the `avatar.png` file with an image of choice. The image of choice needs to be a **PNG** file and named `avatar.png`.
