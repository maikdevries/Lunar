const https = require('https');

module.exports = {
	description: '',

	getTwitch,
	getYouTube,
	getTwitchToken,
	validateTwitchToken
}


async function getTwitch (accessToken, path) {
	const options = {
		host: 'api.twitch.tv',
		path: `/helix/${path}`,
		method: 'GET',
		headers: {
			'Client-ID': process.env.TWITCH_ID,
			Authorization: `Bearer ${accessToken}`
		}
	}

	return await API(options);
}

async function getYouTube (path) {
	const options = {
		host: 'www.googleapis.com',
		path: `/youtube/v3/${path}`,
		method: 'GET'
	}

	return await API(options);
}


async function getTwitchToken () {
	const options = {
		host: 'id.twitch.tv',
		path: `/oauth2/token?client_id=${process.env.TWITCH_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`,
		method: 'POST'
	}

	return await API(options);
}

async function validateTwitchToken (accessToken) {
	const options = {
		host: 'id.twitch.tv',
		path: '/oauth2/validate',
		method: 'GET',
		headers: {
			Authorization: `OAuth ${accessToken}`
		}
	}

	return await API(options);
}

function API (options) {
	return new Promise((resolve, reject) => {
		https.request(options, (res) => {
			if (res.statusCode === 401) return reject('UNAUTHORISED');
			if (res.statusCode !== 200) return resolve(false);

			const rawData = [];
			res.on('data', (chunk) => rawData.push(chunk));
			res.on('end', () => {
				try {
					return resolve(JSON.parse(Buffer.concat(rawData)));
				} catch { return resolve(false) }
			});
		}).end()
			.on('error', () => resolve(false));
	});
}
