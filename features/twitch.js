const { MessageEmbed } = require('discord.js');

const { channelPermissionsCheck } = require('./../shared/permissionCheck.js');
const request = require('./../shared/httpsRequest.js');


const GUILDS_A_MINUTE = (800 / 5) * .95;

const defaultTwitchSettings = {
	"guild": "",
	"streaming": false,
	"sentMessages": [],
	"settings": {}
}

let accessToken;


module.exports = {
	description: 'Interacts with the Twitch API to do various tasks, such as livestream announcements',
	setup,
	validateChannel
}


async function setup (client) {
	if (!accessToken) accessToken = (await request.getTwitchToken()).access_token;

	const guilds = Array.from((client.settings.filter((guild) => guild.twitch.enabled)).keys());
	return loopGuilds(client, guilds);
}

async function loopGuilds (client, guilds) {
	const timer = new Promise((ignore) => setTimeout((ignore), 60000));

	for (let i = 0; i < guilds.length; i += GUILDS_A_MINUTE) {
		await execute(client, guilds.slice(i, i + GUILDS_A_MINUTE));
		await timer;
	}

	return setTimeout(() => setup(client), 60000);
}

async function execute (client, guilds) {
	await guilds.forEach((guildID) => getStream(client, guildID));
}


async function getStream (client, guildID) {
	const streamSettings = await getGuildSettings(client, guildID);

	if (!streamSettings.settings.enabled) return client.twitch.delete(streamSettings.guild);
	if (!streamSettings.settings.username || !streamSettings.settings.channels.length) {
		client.twitch.delete(streamSettings.guild);
		return console.error(`Cannot send Twitch announcement, setup not complete for guild: ${streamSettings.guild}!`);
	}

	try { await request.validateTwitchToken(accessToken) }
	catch { accessToken = (await request.getTwitchToken()).access_token }

	const path = `streams?user_login=${streamSettings.settings.username}`;
	const streamInfo = await request.getTwitch(accessToken, path);

	if (!streamInfo?.data) return;

	if (!streamInfo?.data?.[0] && streamSettings.streaming) {
		client.twitch.set(streamSettings.guild, false, 'streaming');
		await setStreamAnnouncementOffline(client, streamSettings.guild);
		if (!client.twitch.get(streamSettings.guild, 'streaming')) return client.twitch.delete(streamSettings.guild);
	} else {
		if (streamSettings.streaming) return await updateStreamAnnouncement(client, streamSettings.guild);
		client.twitch.set(streamSettings.guild, true, 'streaming');

		const [newUserInfo, newStreamInfo, newGameInfo, newVideoInfo] = await getData(streamSettings.settings.username, streamSettings.settings.username, true, null);
		if (!newUserInfo?.data?.[0] || !newStreamInfo?.data?.[0] || !newGameInfo?.data?.[0]) return client.twitch.set(streamSettings.guild, false, 'streaming');
		else return sendStreamAnnouncement(client, streamSettings, newStreamInfo, newUserInfo, newGameInfo);
	}
}

function sendStreamAnnouncement (client, streamSettings, streamInfo, userInfo, gameInfo) {
	const embed = new MessageEmbed()
		.setAuthor(`${streamInfo.data[0].user_name} is now LIVE on Twitch!`, userInfo.data[0].profile_image_url)
		.setTitle(streamInfo.data[0].title)
		.setURL(`https://twitch.tv/${streamInfo.data[0].user_name}`)
		.setDescription(`**${streamInfo.data[0].user_name}** is playing **${gameInfo.data[0].name}** with **${streamInfo.data[0].viewer_count}** people watching!\n\n[**Come watch the stream!**](https://twitch.tv/${streamInfo.data[0].user_name})`)
		.setColor('#6441A5')
		.setThumbnail((gameInfo.data[0].box_art_url).replace('{width}', '300').replace('{height}', '400'))
		.setImage(`${(streamInfo.data[0].thumbnail_url).replace('{width}', '1920').replace('{height}', '1080')}?date=${Date.now()}`)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date(streamInfo.data[0].started_at));

	streamSettings.settings.channels.forEach((channelID) => {
		const channel = client.channels.cache.get(channelID);

		if (!channel) return console.error(`Cannot send Twitch announcement for channel: ${channelID}, it no longer exists!`);
		if (!channelPermissionsCheck(client, channel, ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MENTION_EVERYONE'])) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES or MENTION_EVERYONE) for channel: ${channel.id}!`);

		const message = streamSettings.settings.messages[Math.floor(Math.random() * streamSettings.settings.messages.length)];
		return channel.send(message, { embed }).then((msg) => client.twitch.push(streamSettings.guild, { 'channelID': msg.channel.id, 'messageID': msg.id }, 'sentMessages'));
	});
}

async function updateStreamAnnouncement (client, guildID) {
	const streamSettings = client.twitch.get(guildID);

	const [newUserInfo, newStreamInfo, newGameInfo, newVideoInfo] = await getData(streamSettings.settings.username, streamSettings.settings.username, true, null);
	if (!newUserInfo?.data?.[0] || !newStreamInfo?.data?.[0] || !newGameInfo?.data?.[0]) return;

	streamSettings.sentMessages.forEach(async (savedMessage) => {
		const channel = client.channels.cache.get(savedMessage.channelID);
		if (!channel) return console.error(`Cannot update Twitch announcement for channel: ${savedMessage.channelID}, it no longer exists!`);

		const message = await channel.messages.fetch(savedMessage.messageID);
		if (!message?.embeds?.[0]) return console.error(`Cannot update Twitch announcement for message: ${savedMessage.messageID}, it no longer exists!`);

		const editedEmbed = new MessageEmbed(message.embeds[0])
			.setAuthor(`${newStreamInfo.data[0].user_name} is now LIVE on Twitch!`, newUserInfo.data[0].profile_image_url)
			.setTitle(newStreamInfo.data[0].title)
			.setDescription(`**${newStreamInfo.data[0].user_name}** is playing **${newGameInfo.data[0].name}** with **${newStreamInfo.data[0].viewer_count}** people watching!\n\n[**Come watch the stream!**](https://twitch.tv/${newStreamInfo.data[0].user_name})`)
			.setThumbnail((newGameInfo.data[0].box_art_url).replace('{width}', '300').replace('{height}', '400'))
			.setImage(`${(newStreamInfo.data[0].thumbnail_url).replace('{width}', '1920').replace('{height}', '1080')}?date=${Date.now()}`)
			.setTimestamp(new Date(newStreamInfo.data[0].started_at));

		return message.edit(message.content, editedEmbed);
	});
}

async function setStreamAnnouncementOffline (client, guildID) {
	const streamSettings = client.twitch.get(guildID);

	const [newUserInfo, newStreamInfo, newGameInfo, newVideoInfo] = await getData(streamSettings.settings.username, null, null, true);
	if (!newUserInfo?.data?.[0] || !newVideoInfo?.data?.[0]) return client.twitch.set(streamSettings.guild, true, 'streaming');

	streamSettings.sentMessages.forEach(async (savedMessage) => {
		const channel = client.channels.cache.get(savedMessage.channelID);
		if (!channel) return console.error(`Cannot take Twitch announcement offline for channel: ${savedMessage.channelID}, it no longer exists!`);

		const message = await channel.messages.fetch(savedMessage.messageID);
		if (!message?.embeds?.[0]) return console.error(`Cannot take Twitch announcement offline for message: ${savedMessage.messageID}, it no longer exists!`);

		const editedEmbed = new MessageEmbed(message.embeds[0])
			.setAuthor(`${newUserInfo.data[0].display_name} was LIVE on Twitch!`, newUserInfo.data[0].profile_image_url)
			.setTitle(newVideoInfo.data[0].title)
			.setURL(newVideoInfo.data[0].url)
			.setDescription(`Today's stream is **over** but you can watch the **VOD**!\n\n[**Watch the VOD!**](${newVideoInfo.data[0].url})`)
			.setThumbnail()
			.setImage(`${(newVideoInfo.data[0].thumbnail_url).replace('%{width}', '1920').replace('%{height}', '1080')}?date=${Date.now()}`)
			.setTimestamp(new Date(newVideoInfo.data[0].created_at));;


		return message.edit(message.content, editedEmbed);
	});
}


async function getGuildSettings (client, guildID) {
	const guildSettings = client.settings.get(guildID, 'twitch');
	client.twitch.ensure(guildID, defaultTwitchSettings);

	client.twitch.set(guildID, guildID, 'guild');
	client.twitch.set(guildID, guildSettings, 'settings');

	return client.twitch.get(guildID);
}

async function getData (userUsername, streamUsername, gameID, videoUsername) {
	let [userInfo, streamInfo, gameInfo, videoInfo] = [null, null, null, null];

	if (userUsername) userInfo = await request.getTwitch(accessToken, `users?login=${userUsername}`);
	if (streamUsername) streamInfo = await request.getTwitch(accessToken, `streams?user_login=${streamUsername}`);

	if (gameID && streamInfo) gameInfo = await request.getTwitch(accessToken, `games?id=${streamInfo?.data?.[0]?.game_id}`);
	else if (gameID) gameInfo = await request.getTwitch(accessToken, `games?id=${gameID}`);

	if (videoUsername && userInfo) videoInfo = await request.getTwitch(accessToken, `videos?user_id=${userInfo?.data?.[0]?.id}&first=1&type=archive`);
	else if (videoUsername) videoInfo = await request.getTwitch(accessToken, `videos?user_id=${videoUsername}&first=1&type=archive`);

	return [userInfo, streamInfo, gameInfo, videoInfo];
}


async function validateChannel (message, channelName) {
	if (!channelName) {
		message.channel.send(`**Ouch**... You forgot to name a Twitch channel. Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
		return false;
	}

	if (!accessToken) accessToken = (await request.getTwitchToken()).access_token;

	try { await request.validateTwitchToken(accessToken) }
	catch { accessToken = (await request.getTwitchToken()).access_token }

	const path = `users?login=${channelName}`;
	const channelInfo = await request.getTwitch(accessToken, path);

	if (!channelInfo?.data) {
		message.channel.send(`**Oh no**... Something went wrong! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
		return false;
	}

	if (!channelInfo?.data?.[0]) {
		message.channel.send(`**Ehh**... This doesn't seem to be a valid Twitch channel. Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
		return false;
	}

	return channelInfo.data[0].login;
}
