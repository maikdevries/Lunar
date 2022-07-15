const serverMessages = require('../features/serverMessages.js');

module.exports = {
	name: 'guildMemberAdd',
	once: false,
	execute
}

async function execute (client, guildMember) {
	await serverMessages.execute(client, guildMember, 'welcoming');
}
