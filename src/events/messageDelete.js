const path = require('path');
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const intLang = require(path.join(__dirname, '..', 'locale', 'language'));
const {dbReactions} = require(path.join(__dirname, '..', 'utilities', 'dataquery'));

module.exports = async (client, message) => {
    dbReactions.remove({ messageID: message.id }, { multi: true }, error => {
        if (error) return logger.error(intLang('utilities.neDB._errors.removeUnsuccessful', 'messageDelete', 7));
    });
};
