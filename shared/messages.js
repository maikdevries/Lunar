const sMessage = [`Nice`, `Perfect`, `Done`, `All done`, `Alright`, `Great`, `Yay`];
const fMessage = [`Oh no`, `Err`, `Oops`, `Ouch`, `Ehm`, `Golly`, `Ah`, `Aww`, `Uhh`, `Hmm`];

module.exports = {
	description: `A collection of various messages which can be send to the user`,
	successful, somethingWrong,
	successfulSetup,
	clientMissingPermissions, memberMissingPermissions, memberSamePermissions,
	deniedConfirmation, noTime,
	missingArgument, invalidArgument,
	missingMention, invalidMention,
	disabledCommand, restrictedCommand,
	invalidRange, missingBoolean,
	wrongChannelForMessage, rolePositionHigher,
	longNickname,
	nothingFound
}


async function successful (channel) { return success(channel, `Everything went well, you're all set!`) }
async function somethingWrong (channel) { return failure(channel, `Something went wrong, please try again.`) }

async function successfulSetup (channel, setting) { return success(channel, `You're all set, but you can change more settings through the \`${setting}\` command.`) }

async function clientMissingPermissions (channel, permissions) { return failure(channel, `It seems that I'm missing the \`${permissions.join(`, `)}\` Discord permission(s) to do this.`) }
async function memberMissingPermissions (channel) { return failure(channel, `You don't have the right Discord permissions to do this.`) }
async function memberSamePermissions (channel) { return failure(channel, `You can't do this to someone with the same Discord permissions as yourself.`) }

async function deniedConfirmation (channel) { return success(channel, `Please try again if you change your mind.`) }
async function noTime (channel) { return failure(channel, `You weren't able to confirm in time, please try again.`) }

async function missingArgument (channel, arg) { return failure(channel, `You forgot to include the \`${arg}\` argument in your message.`) }
async function invalidArgument (channel, arg) { return failure(channel, `Please double check that the \`${arg}\` argument is valid.`) }

async function missingMention (channel, mention) { return failure(channel, `You forgot to mention a \`${mention}\` in your message.`) }
async function invalidMention (channel, mention) { return failure(channel, `Please double check that the \`${mention}\` mention is correct.`) }

async function disabledCommand (channel) { return failure(channel, `This command has been disabled by the server owner.`) }
async function restrictedCommand (channel) { return failure(channel, `This command can't be used in this channel.`) }

async function invalidRange (channel, lowerBound, upperBound) { return failure(channel, `Please try again with a number between \`${lowerBound}\` and \`${upperBound}\`.`) }
async function missingBoolean (channel, positive, negative) { return failure(channel, `You didn't respond with either \`${positive}\` or \`${negative}\`.`) }

async function wrongChannelForMessage (channel) { return failure(channel, `That message doesn't seem to be part of that Discord channel.`) }
async function rolePositionHigher (channel) { return failure(channel, `This role is higher up in the role hierarchy, please move up my role in the Discord server settings.`) }

async function longNickname (channel) { return failure(channel, `A nickname can't be longer than 32 characters.`) }

async function nothingFound (channel) { return failure(channel, `There were no tracks or albums matching your search query.`) }


function success (channel, message) { return sendMessage(channel, `**${sMessage[Math.floor(Math.random() * sMessage.length)]}**! ${message}`, 3500) }
function failure (channel, message) { return sendMessage(channel, `**${fMessage[Math.floor(Math.random() * fMessage.length)]}**... ${message}`, 5000) }

async function sendMessage (channel, message, timeout) {
	const sentMessage = await channel.send(message);
	return sentMessage.delete({ timeout: timeout });
}
