const path = require('path');
const Datastore = require('nedb');

// NeDB Datastore Collections
const dbReactions = new Datastore({filename: path.join(__dirname, '../..', 'data', 'reactionData.db'), autoload: true});

// Auto compactions of Reactions Database file, every 6 Hours
dbReactions.persistence.setAutocompactionInterval(21600000);

// Datastore Module
module.exports = {

    // NeDB Reactions Queries
    dbReactions: {
        
        // NeDB Reactions Count Query
        count: (query, callback) => {
            return dbReactions.count(query, (error, count) => callback(error, count));
        },

        // NeDB Reactions Find Query
        find: (query, callback) => {
            return dbReactions.find(query, (error, document) => callback(error, document));
        },

        // NeDB Reactions FindOne Query
        findOne: (query, callback) => {
            return dbReactions.findOne(query, (error, document) => callback(error, document));
        },

        // NeDB Reactions Insertion Query
        insert: (query, callback) => {
            return dbReactions.insert(query, (error, document) => callback(error, document));
        },

        // NeDB Reactions Update Query
        update: (query, update, options, callback) => {
            return dbReactions.update(query, update, options, (error, numAffected, affectedDocuments, upsert) => callback(error, numAffected, affectedDocuments, upsert));
        },

        // NeDB Reactions Removal Query
        remove: (query, options, callback) => {
            return dbReactions.remove(query, options, (error, document) => callback(error, document));
        }
    }
};
