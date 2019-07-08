const elasticsearch = require('elasticsearch');
const { host } = require('../../config/elasticsearchConfig');

const esClient = new elasticsearch.Client({
  host,
});

module.exports = {
  esClient,
};
