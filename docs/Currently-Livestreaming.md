This feature hoists certain people that are streaming by adding a role when they are live. This allows them to get more exposure in a Discord server without moving up the entire role in the member list. This can be restricted such that a member needs a required role (e.g. content creator) in order to be hoisted.

The following configuration options must be set to make use of this feature:
- `enabled` [Default is *false*] - This enables/disables the entire feature.
- `streamStatusRole` [Default is *empty*] - This is the ID of the 'Currently Livestreaming' role - the role to give to members that are streaming.

The following configuration options are optional:
- `streamerRole` [Default is *empty*] - This is the ID of the required role that is needed in order to be hoisted.
