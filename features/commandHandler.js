const { Collection } = require(`discord.js`);
const fs = require(`fs`).promises;

const { missingChannelPermissions, missingGuildPermissions } = require(`../shared/functions.js`);
const { somethingWrong, missingArgument, memberMissingPermissions, disabledCommand, restrictedCommand } = require(`../shared/messages.js`);

const commands = new Collection();

module.exports = {
	description: `Handles the command logic based on the commands in the commands folder`,
	commands,
	setup,
	execute
};


async function setup () {
	const commandFiles = (await fs.readdir(`./commands`)).filter((file) => file.endsWith(`.js`));

	for (const file of commandFiles) {
		const command = require(`./../commands/${file}`);
		commands.set(command.name, command);
	}
}

async function execute (client, message) {
	try { if (message.partial) message = await message.fetch() }
	catch (error) { return console.error(`An error occurred fetching a partial message: ${error}`) }

	const guildSettings = client.settings.get(message.guild.id, `commands`);

	if (!message.content.startsWith(guildSettings.prefix || message.author.bot || message.channel.type !== `text`)) return;
	if (await missingChannelPermissions(client, message, message.channel, [`SEND_MESSAGES`, `MANAGE_MESSAGES`])) return console.error(`Missing permissions (SEND_MESSAGES or MANAGE_MESSAGES) to execute command for guild: ${message.guild.id}!`);

	const args = message.content.slice(guildSettings.prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = commands.get(commandName) || commands.find((cmd) => cmd.aliases?.includes(commandName));
	if (!command) return;

	if (!guildSettings[command.name]?.enabled) return disabledCommand(message.channel);
	if (guildSettings[command.name].restricted && guildSettings.channels.length && !guildSettings.channels.includes(message.channel.id)) return restrictedCommand(message.channel);
	if (command.args && !args.length) return missingArgument(message.channel, command.args);

	if (!message.member.hasPermission(command.memberPermissions)) return memberMissingPermissions(message.channel);
	if (await missingChannelPermissions(client, message, message.channel, command.channelPermissions) || await missingGuildPermissions(client, message, message.guild, command.guildPermissions)) return;

	try {
		await message.delete();
		return await command.execute(client, message, args);
	} catch (error) {
		console.error(`Something went wrong when executing a command: ${error}`);
		return somethingWrong(message.channel);
	}
}
