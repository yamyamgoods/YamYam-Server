const elasticsearch = require('elasticsearch');

const esClient = new elasticsearch.Client(elasticsearch);

module.exports = {
    esClient,
}