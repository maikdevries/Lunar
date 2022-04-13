const welcomeMessage = require('../features/welcomeMessage.js');

module.exports = {
	name: 'guildMemberAdd',
	once: false,
	execute
}

async function execute (client, guildMember) {
	await welcomeMessage.execute(client, guildMember, 'welcoming');
}
