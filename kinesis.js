if (process.argv.length <= 2) {
    console.log("Missing argument..");
    console.log("Usage: " + __filename + " <word>");
    process.exit(-1);
}

var twitter = require('twitter');
var aws = require('aws-sdk');

var twitter_api_creds = require('./config/twitter.json');
aws.config.loadFromPath('./config/aws.json');
const searchWord = process.argv[2];

var kinesis = new aws.Kinesis();

var client = new twitter(twitter_api_creds);

var stream = client.stream('statuses/filter', {
    track: searchWord,
    language: 'en'
});

stream.on('data', function(event) {
    if (event.text) {
        var record = JSON.stringify({
            id: event.id,
            timestamp: event['created_at'],
            tweet: event.text.replace(/["'}{|]/g, '')
        }) + '|'; // record delimiter

        kinesis.putRecord({
            Data: record,
            StreamName: 'twitterStream',
            PartitionKey: 'key'
        }, function(err, data) {
            if (err) console.log(err);
            console.log('sending: ', event.text);
        });
    }
});

stream.on('error', function(error) {
    throw error;
});