const successPrefix = ['Nice', 'Perfect', 'Done', 'All done', 'Alright', 'Great', 'Yay'];
const failPrefix = ['Oh no', 'Err', 'Oops', 'Ouch', 'Ehm', 'Golly', 'Ah', 'Aww', 'Uhh', 'Hmm'];

module.exports = {
	description: 'A collection of messages which can be send back to the user',
	success, failure,
	inviteCreated,
	invalidRange, noResults,
	memberMissingPermissions, memberSamePermissions
}

function success () { return `**${successPrefix[Math.floor(Math.random() * successPrefix.length)]}**! Everything went well, you're all set!` }
function failure (message = 'Something went wrong, please try again.') { return `**${failPrefix[Math.floor(Math.random() * failPrefix.length)]}**... ${message}` }

function inviteCreated (invite) { return `**${successPrefix[Math.floor(Math.random() * successPrefix.length)]}**! You can now invite all of your friends through ${invite} for the next 24 hours.` }

function invalidRange (lowerBound, upperBound) { return failure(`Please try again with a number between \`${lowerBound}\` and \`${upperBound}\`.`) }
function noResults () { return failure('There were no results matching your search.') }

function memberMissingPermissions () { return failure('You do not have the right Discord permissions to do this.') }
function memberSamePermissions () { return failure('You cannot do this to someone with the same Discord permissions as you.') }
