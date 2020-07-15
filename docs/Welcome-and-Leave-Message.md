This feature sends out a message in channels whenever a user joins/leaves the Discord server and allows for a direct message to be sent when a user joins the server. It is fully customisable such that either welcome messages or leave messages are sent, or both.

The following configuration settings affect the behaviour of this feature:
- `enabled` [Default is *false*] - This enables/disables sending out a (direct) message on a user joining/leaving the server.
- `channelID` [Default is *empty*] - An array of channels to send the welcome/leave message in - can contain either one or multiple channels.
- `message` [Default is *empty*] - An array of `Strings` that contain custom messages the bot will pick randomly from. If empty, the default message will be used: `[MEMBER] has joined/left the Discord server!`. The `[MEMBER]` flag has to be included in custom messages, or else it will not mention the newly joined user. For direct messages: the message sent to a new member - it cannot have the `[MEMBER]` flag.

Example of the `welcomeMessage` configuration options object:
```JSON
"welcomeMessage": {
	"welcome": {
		"enabled": true,
		"channelID": [
			"618712023768891393",
			"720270501213372417"
		],
		"message": [
			"We've got a new member! Welcome [MEMBER]!",
			"Hi [MEMBER]! **Welcome to the Discord**!",
			"[MEMBER] is to be welcomed to the server!"
		]
	},
	"leave": {
		"enabled": true,
		"channelID": [
			"548991203052486686",
		],
		"message": [
			"[MEMBER] has fallen and will be remembered...",
			"Rest in peace, [MEMBER]. You won't be forgotten."
		]
	},
	"direct" : {
		"enabled": true,
		"message": "Hiya! Welcome to the Discord server, please read the rules and make sure to have a great time!"
	}
}
```
