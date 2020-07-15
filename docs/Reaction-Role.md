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

For now, each reaction role has to be set up manually. In the near future, a set of commands will be implemented to achieve the same result with minimal effort.
