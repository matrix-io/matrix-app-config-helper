require('colors');

fs = require( 'fs' );
yaml = require( 'js-yaml' )
_ = require( 'lodash' )
log = console.log;
util = require('./helpers.js')

config = require('./config.js')
Widget = require('./Widget.js');

config.read();
