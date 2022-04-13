const welcomeMessage = require('../features/welcomeMessage.js');

module.exports = {
	name: 'guildMemberRemove',
	once: false,
	execute
}

async function execute (client, guildMember) {
	await welcomeMessage.execute(client, guildMember, 'farewell');
}
