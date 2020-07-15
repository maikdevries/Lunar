const { guildPermissionsCheck } = require(`./../shared/permissionCheck.js`);

module.exports = {
	name: `kick`,
	aliases: [],
	description: `A command to kick a member from the server`,
	args: true,
	usage: `[PREFIX]kick @[member(s)] (reason)`,
	execute
}


function execute (client, message, args) {
	if (!message.member.hasPermission(`KICK_MEMBERS`)) return message.channel.send(`**Oh no**! You don't have the right perks to do this!`).then((msg) => msg.delete({ timeout: 3500 }));
	if (!guildPermissionsCheck(client, message.guild, [`KICK_MEMBERS`])) return message.channel.send(`**Yikes**! It seems like I don't have the right permissions to do this.`).then((msg) => msg.delete({ timeout: 3500 }));
	if (!message.mentions.members) return message.channel.send(`**Oh snap**! You forgot to mention the person you would like to kick! Try again.`).then((msg) => msg.delete({ timeout: 3500 }));

	message.mentions.members.forEach((member) => {
		if (member.hasPermission(`KICK_MEMBERS`) || member.hasPermission(`BAN_MEMBERS`)) return message.channel.send(`**Uhm**... You can't kick someone with the same privileges as yourself!`).then((msg) => msg.delete({ timeout: 3500 }));

		member.kick(args[1])
			.then((member) => message.channel.send(`**Nice**! You've successfully kicked ${member.displayName} from this server.`).then((msg) => msg.delete({ timeout: 3500 })))
			.catch((error) => {
				console.error(`Something went wrong when kicking a member: ${error}`);
				return message.channel.send(`**Oh no**! Something went terribly wrong! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
			});
	});
}
