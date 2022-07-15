const serverMessages = require('../features/serverMessages.js');

module.exports = {
	name: 'guildMemberRemove',
	once: false,
	execute
}

async function execute (client, guildMember) {
	await serverMessages.execute(client, guildMember, 'farewell');
}
