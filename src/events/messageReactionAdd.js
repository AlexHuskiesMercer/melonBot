const {dbReactions} = require('./utilities/dataquery');
const intLang = require('../locale/language');
const logger = require('../config/logger');

// Event Emittion
module.exports = async (client, reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;

    dbReactions.findOne({ messageID: reaction.message.id }, async (error, result) => {
        if (error) return logger.error(intLang('utilities.neDB._errors.findOneUnsuccessful', 'messageReactionAdd', 13));
        if (!result) return;
        for(let i = 0; i < result.reactionID.length; i++){
            if (reaction.emoji.id !== null && reaction.emoji.id === result.reactionID[i]) return await reaction.message.guild.members.cache.get(user.id).roles.add(result.roleID[i])
                .catch(error => console.log(error));
            if (reaction.emoji.id === null && reaction.emoji.name === result.reactionID[i]) return await reaction.message.guild.members.cache.get(user.id).roles.add(result.roleID[i])
                .catch(error => console.log(error));
        }
    });
};
