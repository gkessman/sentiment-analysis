const aws = require('aws-sdk');
const s3 = new aws.S3();
const docClient = new aws.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    // Build the S3 Params string. Watch out here because we're assuming only 1 record per trigger
    let s3Params = {
        Bucket: event.Records[0].s3.bucket.name,
        Key: event.Records[0].s3.object.key
    };
    
    // Build the DynamoDB connect string using environment variables
    let dynParams = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {}
    };
    
    s3.getObject(s3Params, function(err, data) {
        if (err) callback(err);
        let dynamoData = data.Body.toString().split('|');
        
        dynamoData.pop(); // get rid of the last entry in the array because it's empty

        dynamoData.forEach(function(row) {
            dynParams.Item = JSON.parse(row);
            docClient.put(dynParams, function(err, data) {
                if (err) callback(err);
                callback(null, data);
            });
        });
    });
    console.log('end?');
};