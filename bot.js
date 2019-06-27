const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');


client.on('ready', async () => {
	if (config.username) {
		await client.user.setUsername(config.username)
			.catch((error) => console.error(`An error occurred when setting the username, ${error}`));
	} else {
		await client.user.setUsername('Source')
			.catch((error) => console.error(`An error occurred when setting the username, ${error}`));
	}

	client.user.setAvatar('./avatar.png')
		.catch((error) => console.error(`An error occurred when setting the avatar, ${error}`));

	if (config.activity) {
		client.user.setActivity(config.activity, { type: 'PLAYING' })
			.catch((error) => console.error(`An error occurred when setting the default activity, ${error}`));
	} else {
		client.user.setActivity('with Admin perks', { type: 'PLAYING' })
			.catch((error) => console.error(`An error occurred when setting the default activity, ${error}`));
	}

	console.log(`${client.user.username} has loaded successfully and is now online!`);
});


client.on('error', (error) => {
	console.error(`An error occurred with Discord, ${error}`);
});

client.login(config.token);


process.on('SIGINT', () => {
	client.destroy();
	process.exit();
});
