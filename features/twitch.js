const { MessageEmbed } = require(`discord.js`);

const { missingChannelPermissions } = require(`../shared/functions.js`);
const { getTwitch, hasTwitchToken, validateTwitchToken, getTwitchToken } = require(`../shared/httpsRequest.js`);
const { somethingWrong, missingArgument, invalidArgument } = require(`../shared/messages.js`);

const GUILDS_A_MINUTE = (800 / 5) * .95;

const defaultTwitchSettings = {
	"guild": "",
	"streaming": false,
	"sentMessages": [],
	"settings": {}
}

module.exports = {
	description: `Interacts with the Twitch API to do various tasks, such as livestream announcements`,
	setup,
	validateChannel
}


async function setup (client) {
	if (!await hasTwitchToken()) await getTwitchToken();

	const guilds = Object.keys(await client.settings.filter(`twitch.enabled`, true));
	return loopGuilds(client, guilds);
}

async function loopGuilds (client, guilds) {
	if (guilds.length) {
		for (let i = 0; i < guilds.length; i += GUILDS_A_MINUTE) {
			await execute(client, guilds.slice(i, i + GUILDS_A_MINUTE));
			await new Promise((ignore) => setTimeout((ignore), 60000));
		}
		return setup(client);
	} else return setTimeout(() => setup(client), 60000);
}

async function execute (client, guilds) {
	await guilds.forEach((guildID) => getStream(client, guildID));
}

async function getStream (client, guildID) {
	const streamSettings = await getGuildSettings(client, guildID);

	if (!streamSettings?.settings?.enabled) return await client.twitch.delete(streamSettings.guild);
	if (!streamSettings.settings.username || !streamSettings.settings.channels?.length) {
		await client.twitch.delete(streamSettings.guild);
		return console.error(`Cannot send Twitch announcement, setup not complete for guild: ${streamSettings.guild}!`);
	}

	try { await validateTwitchToken() }
	catch { await getTwitchToken() }

	const path = `streams?user_login=${streamSettings.settings.username}`;
	const streamInfo = await getTwitch(path);
	if (!streamInfo?.data) return;

	if (!streamInfo.data[0] && streamSettings.streaming) {
		await client.twitch.set(`${streamSettings.guild}.streaming`, false);
		await setStreamAnnouncementOffline(client, streamSettings);
		if (!await client.twitch.get(`${streamSettings.guild}.streaming`)) return await client.twitch.set(`${streamSettings.guild}.sentMessages`, []);
	} else {
		if (streamSettings.streaming) return await updateStreamAnnouncement(client, streamSettings);
		await client.twitch.set(`${streamSettings.guild}.streaming`, true);

		const [newUserInfo, newStreamInfo, newGameInfo, newVideoInfo] = await getData(streamSettings.settings.username, streamSettings.settings.username, true, null);
		if (!newUserInfo?.data?.[0] || !newStreamInfo?.data?.[0] || !newGameInfo?.data?.[0]) return await client.twitch.set(`${streamSettings.guild}.streaming`, false);
		else return sendStreamAnnouncement(client, streamSettings, newStreamInfo, newUserInfo, newGameInfo);
	}
}

function sendStreamAnnouncement (client, streamSettings, streamInfo, userInfo, gameInfo) {
	const embed = new MessageEmbed()
		.setAuthor(`${streamInfo.data[0].user_name} is now LIVE on Twitch!`, userInfo.data[0].profile_image_url)
		.setTitle(streamInfo.data[0].title)
		.setURL(`https://twitch.tv/${streamInfo.data[0].user_name}`)
		.setDescription(`**${streamInfo.data[0].user_name}** is playing **${gameInfo.data[0].name}** with **${streamInfo.data[0].viewer_count}** viewer(s) watching!\n\n[**Come watch the stream!**](https://twitch.tv/${streamInfo.data[0].user_name})`)
		.setColor(`#6441A5`)
		.setThumbnail((gameInfo.data[0].box_art_url).replace(`{width}`, `300`).replace(`{height}`, `400`))
		.setImage(`${(streamInfo.data[0].thumbnail_url).replace(`{width}`, `1920`).replace(`{height}`, `1080`)}?date=${Date.now()}`)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date(streamInfo.data[0].started_at));

	streamSettings.settings.channels.forEach(async (channelID) => {
		const channel = client.channels.cache.get(channelID);

		if (!channel) return console.error(`Cannot send Twitch announcement for channel: ${channelID}, it no longer exists!`);
		if (await missingChannelPermissions(client, null, channel, [`VIEW_CHANNEL`, `SEND_MESSAGES`, `MENTION_EVERYONE`])) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES or MENTION_EVERYONE) to send out Twitch announcement for channel: ${channel.id}!`);

		const message = streamSettings.settings.messages[Math.floor(Math.random() * streamSettings.settings.messages.length)];
		return channel.send(message, { embed }).then(async (msg) => await client.twitch.push(`${streamSettings.guild}.sentMessages`, { 'channelID': msg.channel.id, 'messageID': msg.id }, false));
	});
}

async function updateStreamAnnouncement (client, streamSettings) {
	const [newUserInfo, newStreamInfo, newGameInfo, newVideoInfo] = await getData(streamSettings.settings.username, streamSettings.settings.username, true, null);
	if (!newUserInfo?.data?.[0] || !newStreamInfo?.data?.[0] || !newGameInfo?.data?.[0]) return;

	streamSettings.sentMessages.forEach(async (savedMessage) => {
		const channel = client.channels.cache.get(savedMessage.channelID);
		if (!channel) return await client.twitch.remove(`${streamSettings.guild}.sentMessages`, (message) => message.messageID === savedMessage.messageID);

		try { var message = await channel.messages.fetch(savedMessage.messageID) }
		catch (error) { return await client.twitch.remove(`${streamSettings.guild}.sentMessages`, (message) => message.messageID === savedMessage.messageID) }

		if (!message?.embeds?.[0]) return await client.twitch.remove(`${streamSettings.guild}.sentMessages`, (message) => message.messageID === savedMessage.messageID);

		const editedEmbed = new MessageEmbed(message.embeds[0])
			.setAuthor(`${newStreamInfo.data[0].user_name} is now LIVE on Twitch!`, newUserInfo.data[0].profile_image_url)
			.setTitle(newStreamInfo.data[0].title)
			.setDescription(`**${newStreamInfo.data[0].user_name}** is playing **${newGameInfo.data[0].name}** with **${newStreamInfo.data[0].viewer_count}** viewer(s) watching!\n\n[**Come watch the stream!**](https://twitch.tv/${newStreamInfo.data[0].user_name})`)
			.setThumbnail((newGameInfo.data[0].box_art_url).replace(`{width}`, `300`).replace(`{height}`, `400`))
			.setImage(`${(newStreamInfo.data[0].thumbnail_url).replace(`{width}`, `1920`).replace(`{height}`, `1080`)}?date=${Date.now()}`)
			.setTimestamp(new Date(newStreamInfo.data[0].started_at));

		return message.edit(message.content, editedEmbed);
	});
}

async function setStreamAnnouncementOffline (client, streamSettings) {
	const [newUserInfo, newStreamInfo, newGameInfo, newVideoInfo] = await getData(streamSettings.settings.username, null, null, true);
	if (!newUserInfo?.data?.[0] || !newVideoInfo?.data?.[0]) return await client.twitch.set(`${streamSettings.guild}.streaming`, true);

	streamSettings.sentMessages.forEach(async (savedMessage) => {
		const channel = client.channels.cache.get(savedMessage.channelID);
		if (!channel) return await client.twitch.remove(`${streamSettings.guild}.sentMessages`, (message) => message.messageID === savedMessage.messageID);

		try { var message = await channel.messages.fetch(savedMessage.messageID) }
		catch (error) { return await client.twitch.remove(`${streamSettings.guild}.sentMessages`, (message) => message.messageID === savedMessage.messageID) }

		if (!message?.embeds?.[0]) return await client.twitch.remove(`${streamSettings.guild}.sentMessages`, (message) => message.messageID === savedMessage.messageID);

		const editedEmbed = new MessageEmbed(message.embeds[0])
			.setAuthor(`${newUserInfo.data[0].display_name} was LIVE on Twitch!`, newUserInfo.data[0].profile_image_url)
			.setTitle(newVideoInfo.data[0].title)
			.setURL(newVideoInfo.data[0].url)
			.setDescription(`Today's stream is **over** but you can watch the **VOD**!\n\n[**Watch the VOD!**](${newVideoInfo.data[0].url})`)
			.setThumbnail()
			.setImage(`${(newVideoInfo.data[0].thumbnail_url).replace(`%{width}`, `1920`).replace(`%{height}`, `1080`)}?date=${Date.now()}`)
			.setTimestamp(new Date(newVideoInfo.data[0].created_at));;

		return message.edit(message.content, editedEmbed);
	});
}

async function validateChannel (message, channelName) {
	if (!channelName) {
		await missingArgument(message.channel, `Twitch channel`);
		return false;
	}

	if (!await hasTwitchToken()) await getTwitchToken();

	try { await validateTwitchToken() }
	catch { await getTwitchToken() }

	const path = `users?login=${encodeURI(channelName)}`;
	const channelInfo = await getTwitch(path);

	if (!channelInfo?.data) {
		await somethingWrong(message.channel);
		return false;
	}

	if (!channelInfo.data[0]) {
		await invalidArgument(message.channel, `Twitch channel`);
		return false;
	}

	return channelInfo.data[0].login;
}


async function getGuildSettings (client, guildID) {
	const guildSettings = await client.settings.get(`${guildID}.twitch`);
	await client.twitch.ensure(guildID, defaultTwitchSettings);

	await client.twitch.set(`${guildID}.guild`, guildID);
	await client.twitch.set(`${guildID}.settings`, guildSettings);

	return await client.twitch.get(guildID);
}

async function getData (userUsername, streamUsername, gameID, videoUsername) {
	let [userInfo, streamInfo, gameInfo, videoInfo] = [null, null, null, null];

	if (userUsername) userInfo = await getTwitch(`users?login=${userUsername}`);
	if (streamUsername) streamInfo = await getTwitch(`streams?user_login=${streamUsername}`);

	if (gameID && streamInfo) gameInfo = await getTwitch(`games?id=${streamInfo.data?.[0]?.game_id}`);
	else if (gameID) gameInfo = await getTwitch(`games?id=${gameID}`);

	if (videoUsername && userInfo) videoInfo = await getTwitch(`videos?user_id=${userInfo.data?.[0]?.id}&first=1&type=archive`);
	else if (videoUsername) videoInfo = await getTwitch(`videos?user_id=${videoUsername}&first=1&type=archive`);

	return [userInfo, streamInfo, gameInfo, videoInfo];
}
