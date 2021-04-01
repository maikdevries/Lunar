require(`dotenv`).config()
const fs = require(`fs`).promises;

const Discord = require(`discord.js`);
const client = new Discord.Client({ partials: [`MESSAGE`, `REACTION`] });

const database = require(`./database/setup.js`);
const commandHandler = require(`./features/commandHandler.js`);
const youtube = require(`./features/youtube.js`);
const twitch = require(`./features/twitch.js`);


// Client setup function to be executed as soon as client instance has fully loaded
client.once(`ready`, async () => {
	try { await client.user.setUsername(process.env.DISCORD_USERNAME) }
	catch (error) { console.error(`Something went wrong when setting the client's username: ${error}`) }

	try { await client.user.setActivity(process.env.DISCORD_ACTIVITY, { type: `PLAYING` }) }
	catch (error) { console.error(`Something went wrong when setting the client's activity: ${error}`) }

	try { await client.user.setAvatar(`./avatar.png`) }
	catch (error) { console.error(`Something went wrong when setting the client's avatar: ${error}`) }

	await database.setup(client);
	await commandHandler.setup();

	youtube.setup(client);
	twitch.setup(client);

	const eventFiles = (await fs.readdir(`./events`)).filter((file) => file.endsWith(`.js`));
	for (const file of eventFiles) {
		const event = require(`./events/${file}`);

		if (event.once) client.once(event.name, async (...args) => await event.execute(client, ...args));
		else client.on(event.name, async (...args) => await event.execute(client, ...args));
	}

	console.log(`${client.user.username} has loaded successfully and is now online!`);
});

client.on(`warn`, (warning) => {
	console.warn(`Something went wrong, a warning was thrown: ${warning}`);
});

client.on(`error`, (error) => {
	console.error(`Something went wrong, an error was thrown: ${error}`);
});

client.login(process.env.DISCORD_TOKEN);


process.on(`unhandledRejection`, (error) => {
	console.error(`Something went wrong, an unhandled promise rejection: ${error}`);
});

process.on(`uncaughtException`, (error) => {
	console.error(`Something went wrong, an unhandled exception: ${error}`);
	client.destroy();
	process.exit();
});
