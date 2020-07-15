Allows for the server to lock out new members to certain channels by giving them a role when they join the server. This can be removed manually by members that can manage roles or automatically by making use of a reaction role system.

The following configuration settings affect the behaviour of this feature:
- `enabled` [Default is *false*] - This enables/disables the entire feature.
- `manual` [Default is *false*] - This enables/disables unlocking a member by making use of reaction role. Keep this set to `false` if you want to manually remove `role` from the new member.
- `role` - [Default is *empty*] - The role that locks out new members from certain channels. Make sure to set the right permissions for the channels you want to use this on!
- `message` - [Default is *empty*] - Object that contains the message ID and reaction emoji that removes the `role`. Example of a correct `message` object:
```JSON
"serverLock": {
	"enabled": true,
	"manual": false,
	"role": "709153445944229929",
	"message": {
		"643119241524019232": "👏"
	}
}
```
This will remove the role with ID `709153445944229929` from the member that reacts with '👏' to the message with ID `643119241524019232`.
