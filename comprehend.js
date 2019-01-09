var aws = require('aws-sdk');

aws.config.loadFromPath('./config.json');

var comprehend = new aws.Comprehend();

var params = {
    LanguageCode: 'en',
    Text: process.argv[2]
};

comprehend.detectSentiment(params, function(err, data) {
    if (err) console.log(err);
    else console.log(data);
});