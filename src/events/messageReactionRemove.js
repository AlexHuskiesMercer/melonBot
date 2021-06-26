const path = require('path');
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const intLang = require(path.join(__dirname, '..', 'locale', 'language'));
const {dbReactions} = require(path.join(__dirname, '..', 'utilities', 'dataquery'));

// Event Emittion
module.exports = async (client, reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;

    dbReactions.findOne({ messageID: reaction.message.id }, async (error, result) => {
        if (error) return logger.error(intLang('utilities.neDB._errors.findOneUnsuccessful', 'messageReactionRemove', 13));
        if (!result) return;
        for(let i = 0; i < result.reactionID.length; i++){
            if (reaction.emoji.id !== null && reaction.emoji.id === result.reactionID[i]) return await reaction.message.guild.members.cache.get(user.id).roles.remove(result.roleID[i])
                .catch(error => console.log(error));
            if (reaction.emoji.id === null && reaction.emoji.name === result.reactionID[i]) return await reaction.message.guild.members.cache.get(user.id).roles.remove(result.roleID[i])
                .catch(error => console.log(error));
        }
    });
};
