const { Collection } = require('discord.js');
const { readdir } = require('fs/promises');
const { checkChannelPermissions, checkGuildPermissions } = require('../shared/functions.js');
const { memberMissingPermissions, failure } = require('../shared/messages.js');

const commands = new Collection();

module.exports = {
	setup,
	execute
}

async function setup () {
	const commandFiles = (await readdir('./src/commands')).filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./../commands/${file}`);
		commands.set(command.data.name, command);
	}
}

async function execute (client, interaction) {
	if (!interaction.isCommand()) return;

	const command = commands.get(interaction.commandName);
	if (!command) return;

	if (!interaction.memberPermissions.has(command.memberPermissions)) return await interaction.reply({ content: memberMissingPermissions(), ephemeral: true });
	if (!checkChannelPermissions(client, interaction.channel, command.channelPermissions) || !await checkGuildPermissions(client, interaction.guild, command.guildPermissions)) return;

	try { await command.execute(interaction) }
	catch { await interaction.reply({ content: failure(), ephemeral: true }) }
}
