const https = require(`https`);

let twitchAccessToken;
let spotifyAccessToken;

module.exports = {
	description: `Module that takes care of all outgoing HTTPS requests to various APIs`,
	getTwitch,
	getYouTube,
	getSpotify,
	hasTwitchToken,
	getTwitchToken,
	validateTwitchToken,
	hasSpotifyToken,
	getSpotifyToken,
	validateSpotifyToken
}


async function getTwitch (path) {
	const options = {
		host: `api.twitch.tv`,
		path: `/helix/${path}`,
		method: `GET`,
		headers: {
			'Client-ID': process.env.TWITCH_ID,
			'Authorization': `Bearer ${twitchAccessToken}`
		}
	}

	return await API(options);
}

async function getYouTube (path) {
	const options = {
		host: `www.googleapis.com`,
		path: `/youtube/v3/${path}`,
		method: `GET`
	}

	return await API(options);
}

async function getSpotify (path) {
	const options = {
		host: `api.spotify.com`,
		path: `/v1/${path}`,
		method: `GET`,
		headers: {
			'Authorization': `Bearer ${spotifyAccessToken}`
		}
	}

	return await API(options);
}

async function hasTwitchToken () {
	return !(typeof twitchAccessToken === `undefined` || twitchAccessToken === null);
}

async function getTwitchToken () {
	const options = {
		host: `id.twitch.tv`,
		path: `/oauth2/token?client_id=${process.env.TWITCH_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`,
		method: `POST`
	}

	return twitchAccessToken = (await API(options)).access_token;
}

async function validateTwitchToken () {
	const options = {
		host: `id.twitch.tv`,
		path: `/oauth2/validate`,
		method: `GET`,
		headers: {
			'Authorization': `OAuth ${twitchAccessToken}`
		}
	}

	return await API(options);
}

async function hasSpotifyToken () {
	return !(typeof spotifyAccessToken === `undefined` || spotifyAccessToken === null);
}

async function getSpotifyToken () {
	const postData = `${encodeURIComponent(`grant_type`)}=${encodeURIComponent(`client_credentials`)}`;

	const options = {
		host: `accounts.spotify.com`,
		path: `/api/token`,
		method: `POST`,
		headers: {
			'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_ID}:${process.env.SPOTIFY_SECRET}`).toString(`base64`)}`,
			'Content-Type': `application/x-www-form-urlencoded`,
			'Content-Length': Buffer.byteLength(postData)
		}
	}

	return spotifyAccessToken = (await postAPI(options, postData)).access_token;
}

async function validateSpotifyToken () {
	const options = {
		host: `api.spotify.com`,
		path: `/v1/search?q=mac+miller&type=artist`,
		method: `GET`,
		headers: {
			'Authorization': `Bearer ${spotifyAccessToken}`
		}
	}

	return await API(options);
}


function API (options) {
	return new Promise((resolve, reject) => {
		https.request(options, (res) => {
			if (res.statusCode === 401) return reject(`UNAUTHORISED`);
			if (res.statusCode !== 200) return resolve(false);

			const rawData = [];
			res.on(`data`, (chunk) => rawData.push(chunk));
			res.on(`end`, () => {
				try { return resolve(JSON.parse(Buffer.concat(rawData))) }
				catch { return resolve(false) }
			});
		}).end()
			.on(`error`, () => resolve(false));
	});
}

function postAPI (options, data) {
	return new Promise((resolve, reject) => {
		const request = https.request(options, (res) => {
			if (res.statusCode === 401) return reject(`UNAUTHORISED`);
			if (res.statusCode !== 200) return resolve(false);

			const rawData = [];
			res.on(`data`, (chunk) => rawData.push(chunk));
			res.on(`end`, () => {
				try { return resolve(JSON.parse(Buffer.concat(rawData))) }
				catch { return resolve(false) }
			});
		}).on(`error`, () => resolve(false));

		request.write(data);
		request.end();
	});
}
