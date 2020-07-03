const { Collection } = require('discord.js');
const fs = require('fs').promises;

const { channelPermissionsCheck } = require('./../shared/permissionCheck.js');

const config = require('./../config.json');

const commands = new Collection();


module.exports = {
	description: `Dynamic command handler that executes command if present in the 'commands' folder`,
	setup,
	execute
};


async function setup () {
	const commandFiles = (await fs.readdir('./commands')).filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./../commands/${file}`);
		commands.set(command.name, command);
	}
}

async function execute (client, message) {
	if (message.partial) await message.fetch().catch((error) => console.error(`An error occurred fetching the partial message, ${error}`));

	const guildCommandSettings = client.settings.get(message.guild.id, 'commands');

	if (!message.content.startsWith(guildCommandSettings.prefix) || message.channel.type !== 'text') return;

	if (!channelPermissionsCheck(client, message.channel, ['SEND_MESSAGES', 'MANAGE_MESSAGES'])) return console.error(`Missing permissions (SEND_MESSAGES or MANAGE_MESSAGES) to execute command in ${message.channel.name}!`);

	const args = message.content.slice(guildCommandSettings.prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	// Looks up the command in the Discord Collection by either name directly or one of its aliases
	const command = commands.get(commandName) || commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;

	if (!guildCommandSettings[command.name].enabled) return message.channel.send(`**Err**... This command has been disabled by the server owner.`).then((msg) => msg.delete({ timeout: 3500 }));

	if (guildCommandSettings[command.name].restricted && guildCommandSettings.channelID.length && !guildCommandSettings.channelID.includes(message.channel.id)) return message.channel.send(`**Oops**! This command cannot be used in this channel!`).then((msg) => msg.delete({ timeout: 3500 }));

	if (message.edits.length > 3) return message.channel.send(`**Excuse me**, third time wasn't the charm for you. Please send a new message instead of editing the original.`).then((msg) => msg.delete({ timeout: 3500 }));

	if (command.args && !args.length) return message.channel.send(`**Oh no**! You didn't provide any arguments for this command to work properly! The proper usage would be: \`${command.usage.replace(/\[PREFIX\]/, guildCommandSettings.prefix)}\`. Edit your message to correctly use this command!`).then((msg) => msg.delete({ timeout: 3500 }));

	try {
		command.execute(client, message, args);
		message.delete();
	} catch (error) {
		console.error(`An error occurred executing one of the commands, ${error}`);
		message.channel.send('**Oops**! Something went terribly wrong! Please try again later.').then((msg) => msg.delete({ timeout: 3500 }));
	}
}
