const {Client, Collection} = require('discord.js');
const {discord} = require(`${__dirname}/config/config`);
const client = new Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });
const fs = require('fs');

// Discord Native Collections
client.commands = new Collection();

// Discord Dynamic API Events Collection
const events = fs.readdirSync(`${__dirname}/events`).filter(file => file.endsWith('.js'));
for (const file of events) {
    const event = require(`${__dirname}/events/${file}`);
    const name = file.split('.')[0];
    client.on(name, event.bind(null, client));
}

// Discord Dynamic Commands Collection
const commands = fs.readdirSync(`${__dirname}/events/commands`).filter(file => file.endsWith('.js'));
for (const file of commands) {
    const command = require(`${__dirname}/events/commands/${file}`);
    client.commands.set(command.name, command);
}

// Discord Client Login
client.login(discord.token);
