var Respizer = require('./lib/respizer.js'),
assert = require('assert'),
fs = require('fs');

console.log('Running tests');

assert.ok(Respizer);

// TODO: If Respizer throws events once done, listen for those instead of this horrible timeout..
setTimeout(function(){
  var pathsThatShouldExist = ['1680/test.jpg', '1366/test.jpg', '1024@2x/test.jpg', '1024/test.jpg', '480@2x/test.jpg', '480/test.jpg', '320/test.jpg', '260/test.jpg', 'test.jpg'];

  for (var i=0; i<pathsThatShouldExist.length; i++){
    var filePath = "./test/" + pathsThatShouldExist[i];
    assert.ok(fs.existsSync(filePath));
  }

  console.log('Tests passed!');
  process.exit();


}, 2000);
