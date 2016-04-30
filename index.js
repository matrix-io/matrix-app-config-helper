require('colors');

fs = require( 'fs' );
yaml = require( 'js-yaml' )
_ = require( 'lodash' )
log = console.log;


var config = require('./config.js')

module.exports = {
  read: config.read,
  validate: config.validate
}
