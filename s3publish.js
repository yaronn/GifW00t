var fs = require('fs')
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var dir = require('./treedir');
var mime = require('mime');
    
function uploadFile(file) {
        
  fs.readFile(file, function (err, data) {
    if (err) { throw err; }
    
    var obj =file.substring("./build/".length)
    
    s3.client.putObject({
        Bucket: 'anigif100',
        Key: obj,
        Body: data,
        ACL:'public-read',
        ContentType: mime.lookup(file)
    }, function (err) {
            if (err) {throw err; }
            console.log(file)
        })

    });

}


dir.walk("./build", function(err, results) {
    for (var i=0; i<results.length; i++) {
        uploadFile(results[i])
    }
})