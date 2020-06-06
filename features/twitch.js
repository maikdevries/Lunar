const https = require('https');
const { MessageEmbed } = require('discord.js');

const config = require('./../config.json');


let accessToken;
let streamStatus = false;
let updateInterval;
let sentAnnouncementMessage;


module.exports = {
	description: 'Interacts with the Twitch API to do various tasks, such as livestream announcements',
	fetchStream
};


// Polls API and checks whether channel is currently streaming
function fetchStream (client) {
	if (!config.twitch.enabled) return;

	if (!accessToken) return getAccessToken();

	validateAccessToken().then(() => {
		const path = `streams?user_login=${config.twitch.username}`;

		callAPI(path).then((streamInfo) => {
			if (!streamInfo.data) return;

			if (!streamInfo.data[0]) {
				if (streamStatus) {
					streamStatus = false;
					clearInterval(updateInterval);
					streamOffline();
				}
			} else {
				if (streamStatus) return;

				streamStatus = true;

				fetchData(streamInfo).then(([userInfo, gameInfo]) => {
					if (!userInfo.data || !gameInfo.data) streamStatus = false;
					else sendAnnouncement(client, streamInfo, userInfo, gameInfo);
				});
			}
		});
	});
}

// Fetches additional data required to construct embed
async function fetchData (streamInfo) {
	let path = `users?login=${config.twitch.username}`;
	const userInfo = await callAPI(path);

	path = `games?id=${streamInfo.data[0].game_id}`;
	const gameInfo = await callAPI(path);

	return [userInfo, gameInfo];
}

// Constructs a MessageEmbed and sends it to livestream announcements channel
function sendAnnouncement (client, streamInfo, userInfo, gameInfo) {
	const channel = client.channels.cache.get(config.twitch.announcementChannelID);
	if (!channel) return console.error(`Couldn't send Twitch livestream announcement because the announcement channel couldn't be found.`);

	const botMember = channel.guild.members.cache.get(client.user.id);
	const channelPermissions = channel.permissionsFor(botMember);
	if (!channelPermissions.any('VIEW_CHANNEL') || !channelPermissions.any('SEND_MESSAGES') || !channelPermissions.any('MENTION_EVERYONE')) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES or MENTION_EVERYONE) to send out Twitch announcement to ${channel.name}!`);

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

	return channel.send(config.twitch.announcementMessage, { embed }).then((msg) => { sentAnnouncementMessage = msg; update(); });
}

// Updates the livestream announcement every 3 minutes with current stream statistics
function update () {
	updateInterval = setInterval(() => {
		fetchUpdatedData().then(([streamInfo, gameInfo]) => {
			if (!streamInfo.data || !gameInfo.data) return;

			const editedEmbed = new MessageEmbed(sentAnnouncementMessage.embeds[0])
				.setTitle(streamInfo.data[0].title)
				.setDescription(`**${streamInfo.data[0].user_name}** is playing **${gameInfo.data[0].name}** with **${streamInfo.data[0].viewer_count}** people watching!\n\n[**Come watch the stream!**](https://twitch.tv/${streamInfo.data[0].user_name})`)
				.setThumbnail((gameInfo.data[0].box_art_url).replace('{width}', '300').replace('{height}', '400'))
				.setImage(`${(streamInfo.data[0].thumbnail_url).replace('{width}', '1920').replace('{height}', '1080')}?date=${Date.now()}`);

			return sentAnnouncementMessage.edit(config.twitch.announcementMessage, editedEmbed);
		});
	}, 180000);
}

// Fetches required data needed to update the livestream announcement with current stream statistics
async function fetchUpdatedData () {
	let path = `streams?user_login=${config.twitch.username}`;
	const streamInfo = await callAPI(path);

	path = `games?id=${streamInfo.data[0].game_id}`;
	const gameInfo = await callAPI(path);

	return [streamInfo, gameInfo];
}

// Updates the livestream announcement to reflect that the stream went offline
function streamOffline () {
	fetchOfflineData().then(([userInfo, videoInfo]) => {
		if (!userInfo.data || !videoInfo.data) streamStatus = true;
		else {
			const editedEmbed = new MessageEmbed(sentAnnouncementMessage.embeds[0])
				.setAuthor(`${userInfo.data[0].display_name} was LIVE on Twitch!`, userInfo.data[0].profile_image_url)
				.setTitle(videoInfo.data[0].title)
				.setURL(videoInfo.data[0].url)
				.setDescription(`Today's stream is **over** but you can watch the **VOD**!\n\n[**Watch the VOD!**](${videoInfo.data[0].url})`)
				.setImage(`${(videoInfo.data[0].thumbnail_url).replace('%{width}', '1920').replace('%{height}', '1080')}?date=${Date.now()}`);

			return sentAnnouncementMessage.edit(config.twitch.announcementMessage, editedEmbed);
		}
	});
}

// Fetches required data needed to update livestream announcement with link to VOD
async function fetchOfflineData () {
	let path = `users?login=${config.twitch.username}`;
	const userInfo = await callAPI(path);

	path = `videos?user_id=${userInfo.data[0].id}&first=1&type=archive`;
	const videoInfo = await callAPI(path);

	return [userInfo, videoInfo];
}

// Handler function that requests a new OAuth access token
function getAccessToken () {
	const options = {
		host: 'id.twitch.tv',
		path: `/oauth2/token?client_id=${config.twitch['client-ID']}&client_secret=${config.twitch['client-secret']}&grant_type=client_credentials`,
		method: 'POST'
	};

	API(options).then((res) => {
		accessToken = res.access_token;
	});
}

// Handler function that validates OAuth access token
function validateAccessToken () {
	return new Promise((resolve) => {
		const options = {
			host: 'id.twitch.tv',
			path: '/oauth2/validate',
			method: 'GET',
			headers: {
				Authorization: `OAuth ${accessToken}`
			}
		};

		API(options).then(() => resolve());
	});
}

// Handler function for all Twitch API interactions
function callAPI (path) {
	return new Promise((resolve) => {
		const options = {
			host: 'api.twitch.tv',
			path: `/helix/${path}`,
			method: 'GET',
			headers: {
				'Client-ID': config.twitch['client-ID'],
				Authorization: `Bearer ${accessToken}`
			}
		};

		API(options).then((res) => resolve(res));
	});
}

// Template HTTPS request function, wrapped in a Promise
function API (options) {
	return new Promise((resolve) => {
		https.request(options, (res) => {
			if (res.statusCode === 401) return getAccessToken();
			if (res.statusCode !== 200) return;

			const rawData = [];
			res.on('data', (chunk) => rawData.push(chunk));
			res.on('end', () => {
				try {
					resolve(JSON.parse(Buffer.concat(rawData)));
				} catch (error) { console.error(`An error occurred parsing the Twitch API response to JSON, ${error}`); }
			});
		}).end()
			.on('error', (error) => console.error(`Error occurred while polling Twitch API, ${error}`));
	});
}
