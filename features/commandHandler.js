const { Collection } = require(`discord.js`);
const fs = require(`fs`).promises;

const { channelPermissionsCheck } = require(`./../shared/permissionCheck.js`);

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

	if (message.author.bot || message.channel.type !== `text` || !message.content.startsWith(guildSettings.prefix)) return;
	if (!channelPermissionsCheck(client, message.channel, [`SEND_MESSAGES`, `MANAGE_MESSAGES`])) return console.error(`Missing permissions (SEND_MESSAGES or MANAGE_MESSAGES) to execute command for guild: ${message.guild.id}!`);

	const args = message.content.slice(guildSettings.prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = commands.get(commandName) || commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;

	if (!guildSettings[command.name]?.enabled) return message.channel.send(`**Err**... This command has been disabled by the server owner.`).then((msg) => msg.delete({ timeout: 3500 }));
	if (guildSettings[command.name].restricted && guildSettings.channels?.length && !guildSettings.channels.includes(message.channel.id)) return message.channel.send(`**Oops**! This command cannot be used in this channel!`).then((msg) => msg.delete({ timeout: 3500 }));

	if (message.edits.length > 3) return message.channel.send(`**Excuse me**, third time wasn't the charm for you. Please send a new message instead of editing the original.`).then((msg) => msg.delete({ timeout: 3500 }));
	if (command.args && !args.length) return message.channel.send(`**Oh no**! You didn't provide any arguments for this command to work properly! The proper usage would be: \`${command.usage.replace(/\[PREFIX\]/, guildSettings.prefix)}\`. Edit your message to correctly use this command!`).then((msg) => msg.delete({ timeout: 3500 }));

	try {
		await command.execute(client, message, args);
		return message.delete();
	} catch (error) {
		console.error(`Something went wrong when executing a command: ${error}`);
		return message.channel.send(`**Oops**! Something went terribly wrong! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
	}
}
