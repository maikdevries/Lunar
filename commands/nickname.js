const { successful, missingMention, memberSamePermissions, longNickname } = require(`../shared/messages.js`);

module.exports = {
	name: `nickname`,
	aliases: [`nick`, `name`],
	description: `A command that changes the nickname of a member in a guild`,
	memberPermissions: [`MANAGE_NICKNAMES`],
	guildPermissions: [`MANAGE_NICKNAMES`],
	channelPermissions: [],
	args: `@[member] [nickname]`,
	execute
}


async function execute (ignore, message, args) {
	const member = message.mentions.members?.first();
	if (!member) return missingMention(message.channel, `member`);
	if (member.hasPermission(`MANAGE_NICKNAMES`)) return memberSamePermissions(message.channel);

	const nickname = args.slice(1).join(` `);
	if (!nickname.length) return missingArgument(message.channel, `nickname`);
	if (nickname.length > 32) return longNickname(message.channel);

	await member.setNickname(nickname);
	return successful(message.channel);
}
