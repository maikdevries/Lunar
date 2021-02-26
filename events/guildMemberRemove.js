const welcomeMessage = require(`../features/welcomeMessage.js`);

module.exports = {
	name: `guildMemberRemove`,
	once: false,
	execute(client, member) {
		welcomeMessage.memberRemove(client, member);
	}
};
