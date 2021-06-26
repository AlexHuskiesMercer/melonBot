const path = require('path');
const logger = require(path.join(__dirname, '../..', 'config', 'logger'));
const intLang = require(path.join(__dirname, '../..', 'locale', 'language'));
const {discord} = require(path.join(__dirname, '../..', 'config', 'config'));
const {dbReactions} = require(path.join(__dirname, '../..', 'utilities', 'dataquery'));

module.exports = {
    name: 'messagereact',
    description: 'Associate roles with given reactions.',
    usage: 'messagereact <optional: remove> <MessageID>',
    arguments: true,
    async execute(client, message) {

        // This will remove the Discord Prefix and remove any spaces from start and end of message
        // Will also split the message where ever there is a whitespace
        const args = message.content.slice(discord.prefix.length).trim().split(/\s+/g);

        // Remove Reaction setup messages
        function removeMessages(messageObject, delayMessageTimer) {
            if (messageObject) return messageArray.push(messageObject);
            if (delayMessageTimer === '') delayMessageTimer = 0;
            setTimeout(() => {
                for (let i = 0; i < messageArray.length; i++) messageArray[i].delete();
            }, delayMessageTimer);
        }

        // Remove DB entry for the provided message ID
        function removeDbEntry() {

            // Check if we have an entry for that message ID, if not return
            dbReactions.findOne( { messageID: args[2] }, (error, result) => {
                if (error) return logger.error(intLang('utilities.neDB._errors.findOneUnsuccessful', 'messageReaction', 31));
                if (!result) return message.reply(intLang('commands.messageReaction._errors.findOneMessageIDDoesNotExist'));

                dbReactions.remove( { messageID: args[2] }, {}, error => {
                    if (error) return logger.error(intLang('utilities.neDB._errors.removeUnsuccessful', 'messageReaction', 35));
                    return message.reply(intLang('commands.messageReaction.responses.removeDbEntrySuccessful'));
                });
            });
            
            // Remove all user messages after 5 seconds
            removeMessages(null, 5000);
        }

        // Check if we have an entry for our MessageID, if so we stop and return to user the reason
        function checkDb() {
            dbReactions.findOne( { messageID: messageContent.id }, (error, result) => {
                if (error) return logger.error(intLang('utilities.neDB._errors.findOneUnsuccessful', 'messageReaction', 47));
                if (result) {
                    message.reply(intLang('commands.messageReaction._errors.findOneMessageIDExist'));
                    // Remove all user and setup messages after 5 seconds
                    return removeMessages(null, 5000);
                }
                setMessageReactions(reactionList, 0);
            });
        }

        // Insert the new reactions and roles associated with said reactions, along with the MessageID
        function insertDbEntry() {
            dbReactions.insert( { messageID: messageContent.id, roleID: roleArray, reactionID: reactionArray }, error => {
                if (error) return logger.error(intLang('utilities.neDB._errors.insertUnsuccessful', 'messageReaction', 60));
                return message.reply(intLang('commands.messageReaction.responses.insertDbEntrySuccessful'));
            });

            // Remove all user and setup messages after 5 seconds
            removeMessages(null, 5000);
        }

        // Sends message to channel and forwards the on to function verifyMessageReactions for await Message
        async function setMessageReactions(reactionList) {
            if (reactionIncrement < reactionList.length) message.channel.send(intLang('commands.messageReaction.responses.setMessageReactions', (reactionList[reactionIncrement].emoji.id === null) ? reactionList[reactionIncrement].emoji.name : reactionList[reactionIncrement].emoji.url))
                .then(responseMessage => verifyMessageReactions(responseMessage))
                .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful', 'messageReaction', 72)));

            // If the reactionIncrement is no longer less than reactionList.length we return insertDbEntry
            else return insertDbEntry();
        }

        // Role Array for later comparisons
        let roleArray = [];

        // Reaction Array for later insertion
        let reactionArray = [];

        // Reaction Array for later insertion
        let messageArray = [];

        // Increment for looping through all reactions and so both setMessageReactions and verifyMessageReactions can keep track
        let reactionIncrement = 0;

        // await Message response 
        async function verifyMessageReactions(responseMessage) {

            // Message Array.push() for later deletion
            removeMessages(responseMessage);
            
            // await message from end user
            await responseMessage.channel.awaitMessages(msg => msg.author.id === message.author.id, {max: 1, time: 600000, errors: ['time']})
                .then(async responses => {

                    // Get the first message with whitespace
                    const response = responses.first();

                    // Store users response message for later removal
                    removeMessages(response);

                    // If message was passed cancel, return
                    if (response.content.toLowerCase() === 'cancel') {
                        message.reply(intLang('commands.messageReaction.responses.verifyMessageReactionsCancel'))
                            .then(() => removeMessages(null, 5000))
                            .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful', 'messageReaction', 110)));
                        return;
                    }

                    // Check if passed message was a role name or ID
                    const role = await responseMessage.guild.roles.cache.find(role => role.id === response.content || role.name === response.content || role === response.mentions.roles.first());

                    // If role was not found, return
                    if (!role) {
                        message.reply(intLang('commands.messageReaction._errors.verifyMessageReactionsRole'))
                            .then(() => removeMessages(null, 5000))
                            .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful', 'messageReaction', 121)));
                        return;
                    }

                    // Check if role has been mentioned in previous message
                    if (roleArray.find(arrayID => role.id === arrayID)) {
                        message.reply(intLang('commands.messageReaction._errors.verifyMessageReactionsRoleDuplicate'))
                            .then(() => removeMessages(null, 5000))
                            .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful', 'messageReaction', 129)));
                        return;
                    }

                    // The bot will react to the message, so that the author of the message doesn't remove them by mistake
                    messageContent.react((reactionList[reactionIncrement].emoji.id === null) ? reactionList[reactionIncrement].emoji.name : `<a:${reactionList[reactionIncrement].emoji.name}:${reactionList[reactionIncrement].emoji.id}>`);

                    // Role Array.push() for later insertion
                    roleArray.push(role.id);

                    // Reaction Array.push() for later insertion, also if the Reaction type is custom or standard check
                    reactionArray.push((reactionList[reactionIncrement].emoji.id === null) ? reactionList[reactionIncrement].emoji.name : `${reactionList[reactionIncrement].emoji.id}`);

                    // Increment for the next cycle
                    reactionIncrement++;

                    // Return to setMessageReactions function for next message
                    return setMessageReactions(reactionList);

                }).catch(() => message.reply(intLang('commands.messageReaction._errors.verifyMessageReactionsTimeout'))
                    .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful', 'messageReaction', 149))));
        }

        // Store users message for later removal
        removeMessages(message);

        // If arg 2 was pass remove, then we return to function removeDbEntry
        if (args[1] === 'remove') return removeDbEntry();

        // Fetch the message from the arg 1 of the command
        const messageContent = await message.channel.messages.fetch(args[1])
            .catch(() => message.reply(intLang('commands.messageReaction._errors.messageContentFetch'))
                .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful', 'messageReaction', 161))));

        // Check not own bot message
        if (messageContent.author.bot) return;

        // Retrieve all reactions associated with arg 1 message ID
        const reactionList = await messageContent.reactions.cache.array();
        if (reactionList.length === 0) return message.reply(intLang('commands.messageReaction._errors.reactionListEmpty'))
            .catch(() => logger.error(intLang('discord._errors.messageUnsuccessful', 'messageReaction', 169)));

        // We check that our message ID does not exist
        return checkDb();
    }
};
