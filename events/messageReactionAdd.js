const reactionRole = require(`../features/reactionRole.js`);
const serverLock = require(`../features/serverLock.js`);

module.exports = {
	name: `messageReactionAdd`,
	once: false,
	execute(client, reaction, user) {
		reactionRole.roleAdd(client, reaction, user);
		serverLock.memberUnlock(client, reaction, user);
	}
};
