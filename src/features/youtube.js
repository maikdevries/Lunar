const { MessageEmbed, Permissions } = require('discord.js');
const { getYouTube } = require('../shared/https.js');
const { checkChannelPermissions } = require('../shared/functions.js');

module.exports = {
	description: 'Interacts with the YouTube API to do various tasks, such as video release announcements',
	setup
}

const MINUTES_A_GUILD = (1440 / (10000 / 4)) * 1.05;

const defaultVideoSettings = {
	"guildID": "",
	"latestVideo": "",
	"settings": {}
}

async function setup (client) {
	const guilds = Object.keys(await client.settings.filter('youtube.enabled', true));
	return execute(client, guilds);
}

async function execute (client, guilds) {
	for (const guildID of guilds) await getVideo(client, guildID);
	return setTimeout(() => setup(client), (MINUTES_A_GUILD * guilds.length < 1 ? 60000 : MINUTES_A_GUILD * guilds.length * 60000));
}

async function getVideo (client, guildID) {
	const guildSettings = await getGuildSettings(client, guildID);

	if (!guildSettings.settings.enabled) return await client.youtube.delete(guildSettings.guildID);

	const [channelData, videoData] = await getData(guildSettings.settings.username, true);
	if (!channelData?.items?.[0] || !videoData?.items?.[0]) return;

	if (videoData.items[0].snippet.resourceId.videoId === guildSettings.latestVideo) return;
	return await sendVideoAnnouncement(client, guildSettings, channelData, videoData);
}

async function sendVideoAnnouncement (client, guildSettings, channelData, videoData) {
	const description = videoData.items[0].snippet.description.replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, '$1');
	const thumbnail = videoData.items[0].snippet.thumbnails.maxres || videoData.items[0].snippet.thumbnails.standard || videoData.items[0].snippet.thumbnails.high;

	const embed = new MessageEmbed()
		.setAuthor({ name: `${channelData.items[0].snippet.title} has uploaded a new YouTube video!`, url: `https://youtube.com/watch?v=${videoData.items[0].snippet.resourceId.videoId}`, iconURL: channelData.items[0].snippet.thumbnails.high.url })
		.setTitle(videoData.items[0].snippet.title)
		.setURL(`https://youtube.com/watch?v=${videoData.items[0].snippet.resourceId.videoId}`)
		.setDescription(`${description}...\n\n[**Watch the video here!**](https://youtube.com/watch?v=${videoData.items[0].snippet.resourceId.videoId})`)
		.setColor('#FF0000')
		.setImage(thumbnail.url)
		.setFooter({ text: `Powered by ${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL() })
		.setTimestamp(new Date(videoData.items[0].snippet.publishedAt));

	let channel;
	try { channel = await client.channels.fetch(guildSettings.settings.channel) }
	catch { return }

	if (!checkChannelPermissions(client, channel, [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.MENTION_EVERYONE])) return;

	await channel.send({ content: guildSettings.settings.message || ' ', embeds: [embed] });
	return await client.youtube.set(`${guildSettings.guildID}.latestVideo`, videoData.items[0].snippet.resourceId.videoId);
}

async function getGuildSettings (client, guildID) {
	const guildSettings = await client.settings.get(`${guildID}.youtube`);
	await client.youtube.ensure(guildID, defaultVideoSettings);

	await client.youtube.set(`${guildID}.guildID`, guildID);
	await client.youtube.set(`${guildID}.settings`, guildSettings);

	return await client.youtube.get(guildID);
}

async function getData (username, videoID) {
	let [channelData, videoData] = [null, null];

	if (username?.includes('channel')) channelData = await getYouTube(`channels?part=snippet&part=contentDetails&id=${username.split('/').at(-1)}&key=${process.env.YOUTUBE_KEY}`);
	else if (username) channelData = await getYouTube(`channels?part=snippet&part=contentDetails&forUsername=${username.split('/').at(-1)}&key=${process.env.YOUTUBE_KEY}`);

	if (videoID && channelData?.items?.[0]) videoData = await getYouTube(`playlistItems?part=snippet&maxResults=1&playlistId=${channelData.items[0].contentDetails.relatedPlaylists.uploads}&key=${process.env.YOUTUBE_KEY}`);

	return [channelData, videoData];
}
