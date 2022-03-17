const { MessageEmbed, Permissions } = require('discord.js');
const { getTwitch, hasTwitchToken, getTwitchToken, validateTwitchToken } = require('../shared/https.js');
const { checkChannelPermissions } = require('../shared/functions.js');

module.exports = {
	description: 'Interacts with the Twitch API to do various tasks, such as livestream announcements',
	setup
}

const CHANNELS_A_MINUTE = (800 / 5) * .95;

const defaultStreamSettings = {
	'streaming': false,
	'sentMessage': {},
	'settings': {}
}

async function setup (client) {
	if (!hasTwitchToken()) await getTwitchToken();

	const guilds = await client.settings.filter('twitch.enabled', true);
	for (const guildID of await client.twitch.keys) if (!await client.settings.get(`${guildID}.twitch.enabled`)) await client.twitch.delete(guildID);

	const channels = [];
	for (const [guildID, guildSettings] of Object.entries(guilds)) guildSettings.twitch.channels.forEach((channel) => channels.push({ 'guildID': guildID, ...channel }));

	return execute(client, channels);
}

async function execute (client, channels) {
	for (let i = 0; i < channels.length; i += CHANNELS_A_MINUTE) {
		for (const channel of channels.slice(i, i + CHANNELS_A_MINUTE)) await getStream(client, channel);
		await new Promise((ignore) => setTimeout(ignore, 60000));
	}
	return setTimeout(() => setup(client), 60000);
}

async function getStream (client, channel) {
	const channelSettings = await getChannelSettings(client, channel);

	if (!client.settings.get(`${channelSettings.settings.guildID}.twitch.enabled`)) return await client.twitch.delete(`${channelSettings.settings.guildID}.${channelSettings.settings.username}`);

	try { await validateTwitchToken() }
	catch { await getTwitchToken() }

	const [userData, streamData, gameData, videoData] = await getData(null, channelSettings.settings.username, null, null);
	if (!streamData.data) return;

	if (!streamData.data[0] && channelSettings.streaming) return await sendVODAnnouncement(client, channelSettings);
	else {
		if (channelSettings.streaming) return await updateStreamAnnouncement(client, channelSettings);
		else return await sendStreamAnnouncement(client, channelSettings);
	}
}

async function sendStreamAnnouncement (client, channelSettings) {
	const [userData, streamData, gameData, videoData] = await getData(channelSettings.settings.username, channelSettings.settings.username, true, null);
	if (!userData?.data?.[0] || !streamData?.data?.[0] || !gameData?.data?.[0]) return;

	const embed = new MessageEmbed()
		.setAuthor({ name: `${userData.data[0].display_name} is now LIVE on Twitch!`, url: `https://twitch.tv/${userData.data[0].login}`, iconURL: userData.data[0].profile_image_url })
		.setTitle(streamData.data[0].title)
		.setURL(`https://twitch.tv/${userData.data[0].login}`)
		.setDescription(`**${userData.data[0].display_name}** is playing **${gameData.data[0].name}** with **${streamData.data[0].viewer_count}** people watching!\n\n[**Come watch the stream!**](https://twitch.tv/${userData.data[0].login})`)
		.setColor('#6441A5')
		.setThumbnail((gameData.data[0].box_art_url).replace('{width}', '300').replace('{height}', '400'))
		.setImage(`${(streamData.data[0].thumbnail_url).replace('{width}', '1920').replace('{height}', '1080')}?date=${Date.now()}`)
		.setFooter({ text: `Powered by ${client.user.username}`, iconURL: client.user.avatarURL() })
		.setTimestamp(new Date(streamData.data[0].started_at));

	let channel;
	try { channel = await client.channels.fetch(channelSettings.settings.channel) }
	catch { return }

	if (!checkChannelPermissions(client, channel, [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.MENTION_EVERYONE])) return;

	channel.send({ content: channelSettings.settings.message || ' ', embeds: [embed] }).then(async (message) => await client.twitch.set(`${channelSettings.settings.guildID}.${channelSettings.settings.username}.sentMessage`, { channelID: channel.id, messageID: message.id }));
	return await client.twitch.set(`${channelSettings.settings.guildID}.${channelSettings.settings.username}.streaming`, true);
}

async function updateStreamAnnouncement (client, channelSettings) {
	const [userData, streamData, gameData, videoData] = await getData(channelSettings.settings.username, channelSettings.settings.username, true, null);
	if (!userData?.data?.[0] || !streamData?.data?.[0] || !gameData?.data?.[0]) return;

	let channel, message;
	try { channel = await client.channels.fetch(channelSettings.sentMessage.channelID); message = await channel.messages.fetch(channelSettings.sentMessage.messageID) }
	catch { return }

	if (!message?.embeds?.[0]) { return }

	const updatedEmbed = new MessageEmbed(message.embeds[0])
		.setTitle(streamData.data[0].title)
		.setDescription(`**${userData.data[0].display_name}** is playing **${gameData.data[0].name}** with **${streamData.data[0].viewer_count}** people watching!\n\n[**Come watch the stream!**](https://twitch.tv/${userData.data[0].login})`)
		.setThumbnail((gameData.data[0].box_art_url).replace('{width}', '300').replace('{height}', '400'))
		.setImage(`${(streamData.data[0].thumbnail_url).replace('{width}', '1920').replace('{height}', '1080')}?date=${Date.now()}`);

	return message.edit({ embeds: [updatedEmbed] });
}

async function sendVODAnnouncement (client, channelSettings) {
	const [userData, streamData, gameData, videoData] = await getData(channelSettings.settings.username, null, null, true);
	if (!userData?.data?.[0] || !videoData?.data?.[0]) return;

	let channel, message;
	try { channel = await client.channels.fetch(channelSettings.sentMessage.channelID); message = await channel.messages.fetch(channelSettings.sentMessage.messageID) }
	catch { return }

	if (!message?.embeds?.[0]) return;

	const updatedEmbed = new MessageEmbed(message.embeds[0])
		.setAuthor({ name: `${userData.data[0].display_name} was LIVE on Twitch!`, url: videoData.data[0].url, iconURL: userData.data[0].profile_image_url })
		.setTitle(videoData.data[0].title)
		.setURL(videoData.data[0].url)
		.setDescription(`Today's stream has **ended** but you can watch the **VOD**!\n\n[**Watch the VOD!**](${videoData.data[0].url})`)
		.setThumbnail()
		.setImage(`${(videoData.data[0].thumbnail_url).replace('%{width}', '1920').replace('%{height}', '1080')}?date=${Date.now()}`);

	message.edit({ embeds: [updatedEmbed] });
	return await client.twitch.set(`${channelSettings.settings.guildID}.${channelSettings.settings.username}.streaming`, false);
}

async function getChannelSettings (client, channel) {
	await client.twitch.ensure(`${channel.guildID}.${channel.username}`, defaultStreamSettings);
	await client.twitch.set(`${channel.guildID}.${channel.username}.settings`, channel);

	return await client.twitch.get(`${channel.guildID}.${channel.username}`);
}

async function getData (userUsername, streamUsername, gameID, videoUserID) {
	let [userData, streamData, gameData, videoData] = [null, null, null, null];

	if (userUsername) userData = await getTwitch(`users?login=${userUsername}`);
	if (streamUsername) streamData = await getTwitch(`streams?user_login=${streamUsername}`);

	if (gameID && streamData.data?.[0]?.game_id) gameData = await getTwitch(`games?id=${streamData.data[0].game_id}`);
	else if (gameID) gameData = await getTwitch(`games?id=${gameID}`);

	if (videoUserID && userData.data?.[0]?.id) videoData = await getTwitch(`videos?user_id=${userData.data[0].id}&first=1&type=archive`);
	else if (videoUserID) videoData = await getTwitch(`videos?user_id=${videoUserID}&first=1&type=archive`);

	return [userData, streamData, gameData, videoData];
}
