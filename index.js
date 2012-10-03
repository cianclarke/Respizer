#!/usr/bin/env node

var fs = require('fs');

if (!fs.existsSync(process.cwd() + '/respizer.conf.js')) {
  return console.error('\n\tYou need a respizer.conf.js file in your current working directory.\n\tSee https://github.com/davidmarkclements/Respizer for details :)\n');
}

module.exports = require('./lib/respizer');
