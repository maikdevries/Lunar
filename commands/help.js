const { MessageEmbed } = require(`discord.js`);
const { commands } = require(`../features/commandHandler.js`);

module.exports = {
	name: `help`,
	aliases: [],
	description: `A command that provides information on how to use the bot`,
	memberPermissions: [],
	guildPermissions: [],
	channelPermissions: [],
	args: false,
	execute
}


async function execute (client, message, ignored) {
	const guildSettings = client.settings.get(message.guild.id, `commands`);

	const embed = new MessageEmbed()
		.setAuthor(`Possible commands you can use in this server:`, client.user.avatarURL())
		.setColor(`#233A54`)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date());

	commands.filter((command) => guildSettings[command.name]?.enabled === true && message.member.hasPermission(command.memberPermissions)).forEach((command) => embed.addField(`${guildSettings.prefix}${command.name}`, command.description));
	return message.channel.send(embed);
}
