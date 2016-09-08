require('colors');

fs = require( 'fs' );
yaml = require( 'js-yaml' )
_ = require( 'lodash' )
log = console.log;

if (process.argv[2] === 'test'){
  process.env['DEBUG'] = "*";
}

var config = require('./config.js')

if (process.argv[2] === 'test'){
  console.log( require('util').inspect( config.validate(config.read(process.argv[3])), {depth: null}));
}

var v = JSON.parse(require('fs').readFileSync(__dirname + '/package.json')).version;

debug( '📐  [ MATRIX ] App Config Helper v'.green + v.grey )

module.exports = {
  config: config,
  read: config.read,
  validate: config.validate,
  regex: {
    string :/(string|str|s)/,
    object :/(object|obj|o)/,
    float :/(float|fl|f)/,
    integer :/(integer|int|i)/,
    boolean :/(b|bool|boolean)/,
  }
}
