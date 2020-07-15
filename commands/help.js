const { MessageEmbed } = require(`discord.js`);
const commandHandler = require(`./../features/commandHandler.js`);

module.exports = {
	name: `help`,
	aliases: [],
	description: `A command that provides information on how to use the bot`,
	args: false,
	usage: `[PREFIX]help`,
	execute
}


function execute (client, message, ignored) {
	const guildSettings = client.settings.get(message.guild.id, `commands`);

	const embed = new MessageEmbed()
		.setAuthor(`Possible command to use in this server:`, client.user.avatarURL())
		.setColor(`#233A54`)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date());

	commandHandler.commands.filter((command) => guildSettings[command.name].enabled === true).forEach((command) => embed.addField(command.usage.replace(/\[PREFIX\]/, guildSettings.prefix), command.description));
	return message.channel.send(embed);
}
