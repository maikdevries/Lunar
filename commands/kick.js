const { successful, missingMention, memberSamePermissions } = require(`../shared/messages.js`);

module.exports = {
	name: `kick`,
	aliases: [],
	description: `A command to kick a member from the server`,
	memberPermissions: [`KICK_MEMBERS`],
	guildPermissions: [`KICK_MEMBERS`],
	channelPermissions: [],
	args: `[member(s)] (reason)`,
	execute
}


async function execute (ignore, message, args) {
	if (!message.mentions.members?.size) return missingMention(message.channel, `member`);

	message.mentions.members.forEach(async (member) => {
		if (member.hasPermission(`KICK_MEMBERS`) || member.hasPermission(`BAN_MEMBERS`)) return memberSamePermissions(message.channel);

		await member.kick(args.slice(message.mentions.members.size).join(` `));
		return successful(message.channel);
	});
}
