var fs = require('fs')
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var dir = require('./treedir');
var mime = require('mime');
var exec = require('child_process').exec;

var folder = "./build-gzip/build"

function uploadFile(file) {

    var child = exec('gzip -9 ' + file, function (error, stdout, stderr) {
         if (error !== null) {
          throw('exec error: ' + error);
         }
    
         fs.readFile(file+".gz", function (err, data) {
           if (err) { throw err; }
            
           var obj =file.substring(folder.length+"/".length)
    
           s3.client.putObject({
                Bucket: 'anigif100',
                Key: obj,
                Body: data,
                ACL:'public-read',
                ContentType: mime.lookup(file),
                ContentEncoding: "gzip"
                }, function (err) {
                    if (err) {throw err; }
                    console.log(file + " --> " + obj)
                })
    
       });
    });
}


dir.walk(folder, function(err, results) {
    for (var i=0; i<results.length; i++) {
        uploadFile(results[i])
    }
})