const { MessageEmbed, Permissions } = require('discord.js');
const { getYouTube } = require('../shared/https.js');
const { checkChannelPermissions } = require('../shared/functions.js');

module.exports = {
	description: 'Interacts with the YouTube API to do various tasks, such as video release announcements',
	setup
}

const MINUTES_A_CHANNEL = (1440 / (10000 / 4)) * 1.05;

const defaultVideoSettings = {
	'latestVideo': '',
	'settings': {}
}

async function setup (client) {
	const guilds = await client.settings.filter('youtube.enabled', true);
	for (const guildID of await client.youtube.keys) if (!await client.settings.get(`${guildID}.youtube.enabled`)) await client.youtube.delete(guildID);

	const channels = [];
	for (const [guildID, guildSettings] of Object.entries(guilds)) guildSettings.youtube.channels.forEach((channel) => channels.push(({ 'guildID': guildID, ...channel })));

	return execute(client, channels);
}

async function execute (client, channels) {
	for (const channel of channels) await getVideo(client, channel);
	return setTimeout(() => setup(client), (MINUTES_A_CHANNEL * channels.length < 1 ? 60000 : MINUTES_A_CHANNEL * channels.length * 60000));
}

async function getVideo (client, channel) {
	const channelSettings = await getChannelSettings(client, channel);

	if (!client.settings.get(`${channelSettings.settings.guildID}.youtube.enabled`)) return await client.youtube.delete(`${channelSettings.settings.guildID}.${channelSettings.settings.username}`);

	const [channelData, videoData] = await getData(channelSettings.settings.username, true);
	if (!channelData?.items?.[0] || !videoData?.items?.[0]) return;

	if (videoData.items[0].snippet.resourceId.videoId === channelSettings.latestVideo) return;
	return await sendVideoAnnouncement(client, channelSettings, channelData, videoData);
}

async function sendVideoAnnouncement (client, channelSettings, channelData, videoData) {
	const description = videoData.items[0].snippet.description.replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, '$1');
	const thumbnail = videoData.items[0].snippet.thumbnails.maxres || videoData.items[0].snippet.thumbnails.standard || videoData.items[0].snippet.thumbnails.high;

	const embed = new MessageEmbed()
		.setAuthor({ name: `${channelData.items[0].snippet.title} has uploaded a new YouTube video!`, url: `https://youtube.com/watch?v=${videoData.items[0].snippet.resourceId.videoId}`, iconURL: channelData.items[0].snippet.thumbnails.high.url })
		.setTitle(videoData.items[0].snippet.title)
		.setURL(`https://youtube.com/watch?v=${videoData.items[0].snippet.resourceId.videoId}`)
		.setDescription(`${description}...\n\n[**Watch the video here!**](https://youtube.com/watch?v=${videoData.items[0].snippet.resourceId.videoId})`)
		.setColor('#FF0000')
		.setImage(thumbnail.url)
		.setFooter({ text: `Powered by ${client.user.username}`, iconURL: client.user.avatarURL() })
		.setTimestamp(new Date(videoData.items[0].snippet.publishedAt));

	let channel;
	try { channel = await client.channels.fetch(channelSettings.settings.channel) }
	catch { return }

	if (!checkChannelPermissions(client, channel, [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.MENTION_EVERYONE])) return;

	await channel.send({ content: channelSettings.settings.message || ' ', embeds: [embed] });
	return await client.youtube.set(`${channelSettings.settings.guildID}.${channelSettings.settings.username}.latestVideo`, videoData.items[0].snippet.resourceId.videoId);
}

async function getChannelSettings (client, channel) {
	await client.youtube.ensure(`${channel.guildID}.${channel.username}`, defaultVideoSettings);
	await client.youtube.set(`${channel.guildID}.${channel.username}.settings`, channel);

	return await client.youtube.get(`${channel.guildID}.${channel.username}`);
}

async function getData (channelID, videoID) {
	let [channelData, videoData] = [null, null];

	if (channelID) channelData = await getYouTube(`channels?part=snippet&part=contentDetails&id=${channelID}&key=${process.env.YOUTUBE_KEY}`);
	if (videoID && channelData?.items?.[0]) videoData = await getYouTube(`playlistItems?part=snippet&maxResults=1&playlistId=${channelData.items[0].contentDetails.relatedPlaylists.uploads}&key=${process.env.YOUTUBE_KEY}`);

	return [channelData, videoData];
}
