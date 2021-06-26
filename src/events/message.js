const path = require('path');
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const intLang = require(path.join(__dirname, '..', 'locale', 'language'));
const {discord} = require(path.join(__dirname, '..', 'config', 'config'));

// Event Emittion
module.exports = (client, message) => {

    // Message Verification
    if (message.author.bot || message.channel.type !== 'text') return;
    if (!message.content.startsWith(discord.prefix)) return;

    // Only allow admins to run this bot
    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply(intLang('events.message._errors.invalidPermissions'))
        .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful',  'message', 14)));

    // Message Commands Parser
    let args = message.content.slice(discord.prefix.length).trim().split(/\s+/g);
    let commandName = args.shift().toLowerCase();

    // Command Arguments Verification
    const command = client.commands.get(commandName);
    if (!command) return message.reply(intLang('commands._errors.unknownCommandName'))
        .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful',  'message', 23)));
    
    if (command.arguments && !args.length) return message.reply(intLang('events.message._errors.argumentsRequired'))
        .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful', 'message', 26)));

    // Command Execution
    try {
        command.execute(client, message, args);
    } catch(error) {
        logger.error(intLang('commands._errors.executionUnsuccessful', command.name, error, 'message', 32));
        message.reply(intLang('events.message._errors.executionUnsuccessful'))
            .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful',  'message', 34)));
    }
};
