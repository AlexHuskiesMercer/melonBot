const {dbReactions} = require('./utilities/dataquery');
const intLang = require('../locale/language');
const logger = require('../config/logger');

module.exports = async (client, message) => {
    dbReactions.remove({ messageID: message.id }, { multi: true }, error => {
        if (error) return logger.error(intLang('utilities.neDB._errors.removeUnsuccessful', 'messageDelete', 7));
    });
};
