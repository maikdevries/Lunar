const commandHandler = require('../features/commandHandler.js');

module.exports = {
	name: 'interactionCreate',
	once: false,
	execute
}

async function execute (client, interaction) {
	await commandHandler.execute(client, interaction);
}
