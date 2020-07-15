The default way to trigger a command is as follows: `![command] [argument]`, where the behaviour of `[argument]` could vary between the different commands. Arguments listed within parenthesis `([argument])` are optional and therefore not required. The command prefix can be changed in `config.json`, more information [here](#optional-configuration-settings).

Each individual command can be enabled or disabled based on needs. All commands are disabled by default, which can be changed in `config.js` under `commands`. If a disabled command is triggered, the user will be notified. Commands can also be restricted to a specific range of channels, this is disabled by default. Change this behaviour by adding the channel's `channelID` in which commands can be used to the Array of channels and specifying whether the restriction applies to said command - multiple channels can be defined.

Editing a message also supports commands and thus if a message is edited and the right syntax is used, the command will be run as usual. This prevents the member from having to retype the entire message if a small mistake was made. Three attempts can be made and another will return an error message asking the member to send an entirely new message.

The following command behaviour is currently natively supported:
- `8ball/ask [question]?` - This will generate a random answer to the question being asked.
- `about/version` - This will return an embed with the latest technical information on the bot.
- `ban @[user(s)] ([reason])` - This will ban `[user(s)]` from the current server for 7 days with `([reason])` as reason.
- `clear/purge/remove/delete [number] or @[user]` - This will delete as many messages of the past in the current channel with a minimum of *1* and a maximum of up to *99* messages at a time. In case that a `user` is specified, it will delete all messages sent by `[user]` out of the last *99* messages sent in the current channel.
- `invite/link` - This will generate an invite link for the current channel which can be used for 24 hours.
- `kick @[user(s)] ([reason])` - This will kick `[user(s)]` from the current server with `([reason])` as reason.
- `nickname/nick/name @[user] [name]` - This will change the nickname of `[user]` to `[name]`.
- `slowmode/slow [number]` - This will enable slowmode and set it to allow messages to be sent every `number` of seconds - setting it to `0` will turn slowmode off.

The `8ball` command requires responses to be set that are randomly chosen from when someone asks a question. These should be added to the `responses` Array within the `8ball` Object, each separated by a comma. Example configuration Object:
```JSON
"8ball": {
	"enabled": true,
	"restricted": true,
	"responses": [
		"My answer is no.",
		"The answer is yes.",
		"Uhhhh..."
	]
}
```

One could even add commands of their own if they possess the means to do so, please do keep in mind that this is not supported code, things could be wonky or not function the way initially envisioned.
