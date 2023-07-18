require('dotenv').config();

const { REST, Routes } = require('discord.js');
const { readdir } = require('node:fs/promises');

(async () => {
	try {
		console.log('Fetching and uploading Slash Commands to Discord...');

		const commands = [];
		const commandFiles = (await readdir('./src/commands')).filter((file) => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`../commands/${file}`);
			commands.push(command.data.toJSON());
		}

		const rest = new REST().setToken(process.env.DISCORD_TOKEN);

		await rest.put(
			process.env.DISCORD_GUILD_ID ?
				Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID) :
				Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
			{ body: commands },
		);

		console.log('Successfully uploaded Slash Commands to Discord!');
	} catch (error) { console.error(error) };
})();
