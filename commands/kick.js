const { guildPermissionsCheck } = require(`./../shared/permissionCheck.js`);

module.exports = {
	name: `kick`,
	aliases: [],
	description: `A command to kick a member from the server`,
	permissions: [`KICK_MEMBERS`],
	args: true,
	usage: `[PREFIX]kick @[member(s)] (reason)`,
	execute
}


async function execute (client, message, args) {
	if (!guildPermissionsCheck(client, message.guild, [`KICK_MEMBERS`])) return message.channel.send(`**Yikes**! It seems like I don't have the right permissions to do this.`).then((msg) => msg.delete({ timeout: 3500 }));
	if (!message.mentions.members?.size) return message.channel.send(`**Oh snap**! You forgot to mention the person you would like to kick! Try again.`).then((msg) => msg.delete({ timeout: 3500 }));

	message.mentions.members.forEach(async (member) => {
		if (member.hasPermission(`KICK_MEMBERS`) || member.hasPermission(`BAN_MEMBERS`)) return message.channel.send(`**Uhm**... You can't kick someone with the same privileges as yourself!`).then((msg) => msg.delete({ timeout: 3500 }));

		try {
			member = await member.kick(args[1]);
			return message.channel.send(`**Nice**! You've successfully kicked ${member.displayName} from this server.`).then((msg) => msg.delete({ timeout: 3500 }));
		} catch (error) {
			console.error(`Something went wrong when kicking a member: ${error}`);
			return message.channel.send(`**Oh no**! Something went terribly wrong! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
		}
	});
}
