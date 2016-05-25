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


module.exports = {
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
