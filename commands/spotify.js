const { MessageEmbed } = require(`discord.js`);

const { getSpotify, hasSpotifyToken, validateSpotifyToken, getSpotifyToken } = require(`../shared/httpsRequest.js`);
const { somethingWrong, nothingFound } = require(`../shared/messages.js`);

module.exports = {
	name: `spotify`,
	aliases: [`music`],
	description: `A command that allows users to search for tracks and albums on Spotify`,
	memberPermissions: [],
	guildPermissions: [],
	channelPermissions: [],
	args: `[track|album][query]`,
	execute
}


async function execute (client, message, args) {
	if (!await hasSpotifyToken()) await getSpotifyToken();

	try { await validateSpotifyToken() }
	catch { await getSpotifyToken() }

	const path = `search?q=${encodeURI(args.slice(1))}&type=${args[0]}&limit=1`;
	const musicInfo = await getSpotify(path);

	if (!musicInfo) return somethingWrong(message.channel);
	if (!musicInfo.tracks?.total && !musicInfo.albums?.total) return nothingFound(message.channel);

	const data = musicInfo[`${args[0]}s`].items[0];
	const trackAlbumSpecific = data.type === `track` ? [`Duration`, `${new Date(data.duration_ms).getMinutes()} minutes and ${new Date(data.duration_ms).getSeconds()} seconds`] : [`Number of tracks`, data.total_tracks];

	const embed = new MessageEmbed()
		.setAuthor(`Spotify`, `https://developer.spotify.com/assets/branding-guidelines/icon3@2x.png`)
		.setTitle(data.name)
		.setURL(data.external_urls.spotify)
		.setDescription(`by **${data.artists[0].name}**`)
		.addField(`Release date`, new Date(data.album?.release_date || data.release_date).toDateString(), true)
		.addField(trackAlbumSpecific[0], trackAlbumSpecific[1], true)
		.addField(`Listen on Spotify`, data.external_urls.spotify)
		.setColor(`#1DB954`)
		.setThumbnail(data.album?.images[0].url || data.images[0].url)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date());

	return message.channel.send({ embed });
}
