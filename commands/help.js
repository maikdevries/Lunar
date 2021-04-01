const { MessageEmbed } = require(`discord.js`);
const { commands } = require(`../features/commandHandler.js`);
const { disabledCommand, invalidArgument, memberMissingPermissions } = require(`../shared/messages.js`);

module.exports = {
	name: `help`,
	aliases: [`info`],
	description: `A command that provides information on how to use the bot`,
	memberPermissions: [],
	guildPermissions: [],
	channelPermissions: [],
	args: false,
	execute
}


async function execute (client, message, args) {
	const guildSettings = await client.settings.get(`${message.guild.id}.commands`);

	const embed = new MessageEmbed()
		.setAuthor(`How to use the bot:`, client.user.avatarURL())
		.setColor(`#233A54`)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date());

	if (args.length) {
		const command = commands.get(args[0]) || commands.find((cmd) => cmd.aliases?.includes(args[0]));
		if (!command) return invalidArgument(message.channel, `command`);

		if (!guildSettings[command.name]?.enabled) return disabledCommand(message.channel);
		if (!message.member.hasPermission(command.memberPermissions)) return memberMissingPermissions(message.channel);

		embed.addField(`${guildSettings.prefix}${command.name} ${command.args ? command.args : ``}`, command.description);
	} else commands.filter((command) => guildSettings[command.name]?.enabled === true && message.member.hasPermission(command.memberPermissions)).forEach((command) => embed.addField(`${guildSettings.prefix}${command.name} ${command.args ? command.args : ``}`, command.description));

	return message.channel.send(embed);
}
