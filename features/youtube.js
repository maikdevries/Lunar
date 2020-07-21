const { MessageEmbed } = require(`discord.js`);

const { channelPermissionsCheck } = require(`./../shared/functions.js`);
const request = require(`./../shared/httpsRequest.js`);

const MINUTES_A_GUILD = (1440 / (10000 / 9)) * 1.05;

const defaultYouTubeSettings = {
	"guild": "",
	"lastVideo": "",
	"settings": {}
}

module.exports = {
	description: `Interacts with the YouTube API to do various tasks, such as video release announcements`,
	setup,
	validateChannel
};


async function setup (client) {
	const guilds = Array.from((client.settings.filter((guild) => guild.youtube.enabled)).keys());
	return execute(client, guilds);
}

async function execute (client, guilds) {
	await guilds.forEach((guildID) => getVideo(client, guildID));

	return setTimeout(() => setup(client), ((MINUTES_A_GUILD * guilds.length < 60000) ? (MINUTES_A_GUILD * 60000) : (MINUTES_A_GUILD * guilds.length * 60000)));
}


async function getVideo (client, guildID) {
	const videoSettings = await getGuildSettings(client, guildID);

	if (!videoSettings?.settings?.enabled) return client.youtube.delete(videoSettings.guild);
	if (!videoSettings.settings.username || !videoSettings.settings.channels?.length) {
		client.youtube.delete(videoSettings.guild);
		return console.error(`Cannot send YouTube announcement, setup not complete for guild: ${videoSettings.guild}`);
	}

	const [channelSnippet, channelContent, videoSnippet] = await getData(videoSettings.settings.username, videoSettings.settings.username, true);
	if (!channelSnippet?.items?.[0] || !channelContent?.items?.[0] || !videoSnippet?.items?.[0]) return;

	if (videoSnippet.items[0].snippet.resourceId.videoId === videoSettings.lastVideo) return;
	await sendVideoAnnouncement(client, videoSettings, channelSnippet, videoSnippet);

	return client.youtube.set(videoSettings.guild, videoSnippet.items[0].snippet.resourceId.videoId, `lastVideo`);
}

async function sendVideoAnnouncement (client, videoSettings, channelInfo, videoInfo) {
	const shortVideoDescription = (videoInfo.items[0].snippet.description).replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, `$1`);
	const videoThumbnail = videoInfo.items[0].snippet.thumbnails.maxres || videoInfo.items[0].snippet.thumbnails.standard || videoInfo.items[0].snippet.thumbnails.high;

	const embed = new MessageEmbed()
		.setAuthor(`${channelInfo.items[0].snippet.title} has uploaded a new YouTube video!`, channelInfo.items[0].snippet.thumbnails.high.url)
		.setTitle(videoInfo.items[0].snippet.title)
		.setURL(`https://www.youtube.com/watch?v=${videoInfo.items[0].snippet.resourceId.videoId}`)
		.setDescription(`${shortVideoDescription}...\n\n[**Watch the video here!**](https://www.youtube.com/watch?v=${videoInfo.items[0].snippet.resourceId.videoId})`)
		.setColor(`#FF0000`)
		.setImage(videoThumbnail.url)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date(videoInfo.items[0].snippet.publishedAt));

	videoSettings.settings.channels.forEach((channelID) => {
		const channel = client.channels.cache.get(channelID);

		if (!channel) return console.error(`Cannot send YouTube video announcement for channel: ${channelID}, it no longer exists!`);
		if (!channelPermissionsCheck(client, channel, [`VIEW_CHANNEL`, `SEND_MESSAGES`, `MENTION_EVERYONE`])) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES or MENTION_EVERYONE) to send YouTube video announcement for channel: ${channel.id}!`);

		const message = videoSettings.settings.messages[Math.floor(Math.random() * videoSettings.settings.messages.length)];
		return channel.send(message, { embed });
	});
}

async function validateChannel (client, message, channelURL) {
	if (!channelURL) {
		message.channel.send(`**Ouch**... You forgot to link to a YouTube channel. Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
		return false;
	}

	const matches = channelURL.match(/youtube.com\/channel\/([a-zA-Z0-9_\-]{3,24}).*/);
	if (!matches) {
		message.channel.send(`**Ehh**... This doesn't seem to be a valid YouTube URL. Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
		return false;
	}

	if (!await setLatestVideo(client, message, matches[1])) return false;
	return matches[1];
}

async function setLatestVideo (client, message, channelID) {
	const videoSettings = await getGuildSettings(client, message.guild.id);

	const [channelSnippet, channelContent, videoSnippet] = await getData(null, channelID, true);

	if (!videoSnippet?.items?.[0] || channelContent.error || videoSnippet.error) {
		message.channel.send(`**Oh no**... Something went wrong! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
		return false;
	}

	if (!channelContent?.items?.[0]) {
		message.channel.send(`**Ehh**... This doesn't seem to be a valid YouTube channel. Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
		return false;
	}

	return client.youtube.set(videoSettings.guild, videoSnippet.items[0].snippet.resourceId.videoId, `lastVideo`);
}


async function getGuildSettings (client, guildID) {
	const guildSettings = client.settings.get(guildID, `youtube`);
	client.youtube.ensure(guildID, defaultYouTubeSettings);

	client.youtube.set(guildID, guildID, `guild`);
	client.youtube.set(guildID, guildSettings, `settings`);

	return client.youtube.get(guildID);
}

async function getData (snippetChannel, contentChannel, snippetVideo) {
	let [channelSnippet, channelContent, videoSnippet] = [null, null, null];

	if (snippetChannel) channelSnippet = await request.getYouTube(`channels?part=snippet&id=${snippetChannel}&key=${process.env.YOUTUBE_VIDEO_KEY}`);
	if (contentChannel) channelContent = await request.getYouTube(`channels?part=contentDetails&id=${contentChannel}&key=${process.env.YOUTUBE_VIDEO_KEY}`);
	if (snippetVideo && channelContent?.items?.[0]) videoSnippet = await request.getYouTube(`playlistItems?part=snippet&maxResults=1&playlistId=${channelContent.items[0].contentDetails.relatedPlaylists.uploads}&key=${process.env.YOUTUBE_VIDEO_KEY}`);

	return [channelSnippet, channelContent, videoSnippet];
}
