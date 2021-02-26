const welcomeMessage = require(`../features/welcomeMessage.js`);
const serverLock = require(`../features/serverLock.js`);

module.exports = {
	name: `guildMemberAdd`,
	once: false,
	execute(client, member) {
		welcomeMessage.memberAdd(client, member);
		serverLock.memberLock(client, member);
	}
};
