require('colors');

fs = require('fs');
yaml = require('js-yaml')
_ = require('lodash')
var debug = require('debug')('app-config')
log = console.log;

var config = require('./config.js')

module.exports = {
  checkVersion: checkVersion,
  config: config,
  read: config.read,
  regex: {
    string: /(string|str|s)/,
    object: /(object|obj|o)/,
    float: /(float|fl|f)/,
    integer: /(integer|int|i)/,
    boolean: /(b|bool|boolean)/,
  },
  validate: config.validate
}

// this gets called by matrix cli sometimes, lets not turn on debug for no reason
if (process.argv[2] === 'test' && process.argv[1].indexOf('matrix') === -1) {
  process.env.DEBUG = '*';
  console.log(require('util').inspect(config.validate(config.read(process.argv[3])), { depth: null }));
}

/**
 * Compares the current isntalled version against the lastest remote version available
 * @param {Function} cb Returns the following:
 * {Error} err Error details
 * {Object} version object that contains the following parameters:
 *   - {String} local The version of the installed module
 *   - {String} remote The latest version available of the module
 *   - {bool} updated Boolean indicating wether the version is up to date or not
 */
function checkVersion(cb) { 
  var info = JSON.parse(require('fs').readFileSync(__dirname + '/package.json'));
  var currentVersion = info.version;
  require('https').get(
    'https://raw.githubusercontent.com/matrix-io/matrix-app-config-helper/master/package.json',
    function (res) {
      var write = '';
      res.on('data', function (c) {
        write += c;
      });
      res.on('end', function (e) {
        var remoteVersion = JSON.parse(write).version;
        var msg = '';
        if (currentVersion === remoteVersion) {
          module.exports.current = true;
          msg = '(current)'.grey;
        } else {
          module.exports.current = false;
          msg = '(can upgrade to '.yellow + remoteVersion + ')'.yellow
        }
        debug('📐  [ MATRIX ] App Config Helper v'.green + currentVersion.grey, msg)
        cb(undefined, { local: currentVersion, remote: remoteVersion, updated: currentVersion === remoteVersion });
      });
    }).on('error', function (e) {
      var errorMessage; 
      if (e.code === 'ENOTFOUND') errorMessage = 'App Config Helper version check failed, unable to reach module repository';
      else errorMessage = 'App Config Helper upgrade check error: ' + e.message;
      cb(errorMessage);
    })
}

