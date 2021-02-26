const reactionRole = require(`../features/reactionRole.js`);

module.exports = {
	name: `messageReactionRemove`,
	once: false,
	execute(client, reaction, user) {
		reactionRole.roleRemove(client, reaction, user);
	}
};
