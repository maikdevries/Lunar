require('dotenv').config();

const { Client, Events, GatewayIntentBits } = require('discord.js');
const { readFile } = require('node:fs/promises');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (_) => {
	const message = await readFile('./resources/message.md', { encoding: 'utf8' });
	const contactedOwners = [];

	console.log('Sending message to all Discord Guild owners...');

	for (const guild of client.guilds.cache.values()) {
		const guildOwner = await guild.fetchOwner();

		if (!contactedOwners.includes(guildOwner.user.id)) await guildOwner.send(message);

		contactedOwners.push(guildOwner.user.id);
	}

	console.log('Successfully sent the message to all Discord Guild owners!');

	process.nextTick(() => process.exit());
});

client.on('warn', (warning) => console.warn(warning));
client.on('error', (error) => console.error(error));

client.login(process.env.DISCORD_TOKEN);
