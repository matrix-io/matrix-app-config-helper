var util = require('./helpers.js');
var _ = require('lodash')

var debug = require('debug')('config-helper')

var dataTypeRegex = /^(string|str|s|object|obj|o|float|fl|f|integer|int|i|b|bool|boolean)$/;
var dataTypeKeyRegex = /^([a-z0-9_]+)$/i; //Case insensitive alphanumeric and _
var stringRegex = /^(string|str|s)$/;
var objectRegex = /^(object|obj|o)$/;
var floatRegex = /^(float|fl|f)$/;
var integerRegex = /^(integer|int|i)$/;
var booleanRegex = /^(b|bool|boolean)$/;

var sensorRegex = /^(temperature|gyroscope|humidity|microphone|camera|pressure|accelerometer|compass|uv)$/;

module.exports = {
  read: function( fileName ){
    fileName = fileName || 'config.yaml';
    var config;
    try {
      config = yaml.safeLoad( fs.readFileSync(fileName) );
    } catch(e) {
      console.error('Config Read Error')
    }

    return config;
  },

  validate: validate

}

// Validates keys and values matching their corresponding RegExps   
function validateDataTypeStructure(root) {
  var result = true;

  if (_.isObject(root)) { // If it has nested values go over those
    _.each(root, function (value, key) {
      debug('Checking key: ', key);
      if (!key.toString().match(dataTypeKeyRegex)) {
        console.log('Invalid key: ', key, ' Data types must only be named using letters, numbers and "_".');
        result = false;
      }
      if (!validateDataTypeStructure(root[key], key, value)) { 
        result = false; //If any nested match fails, update result
      }
    });
  } else {
    debug('Checking value: ', root);
    if (!root.toString().match(dataTypeRegex)) {
      console.log('Invalid value: ', root, ' Please provide a valid data type.');
      result = false;
    }
  }

  return result;
}


function validate( config ){
  debug('validate');
  try {
    util.keyCheck(config);

    debug('Name:', config.name);
    debug('Desc:', config.description);
    debug('Version:', config.configVersion);
    debug('Keywords:', config.keywords);
    //some apps just don't make data
    if ( _.has(config, 'dataTypes')){
      if (_.isArray(config.dataTypes) || _.isString(config.dataTypes)) {
        throw new Error('dataTypes can not be a string nor an array.');
      }

      debug('DataTypes:', config.dataTypes);
      validateDataTypeStructure(config.dataTypes);

    }

    // debug(config.widgets);
    // check that all screens are widgets
    if ( _.has(config,'widgets') && _.has(config,'screens') ){

      var widgetList = Object.keys( config.widgets );

      var screens = module.exports.screens = config.screens || {};
      var widgets =module.exports.widgets = config.widgets || {};
      var services =module.exports.services = config.services || {};
      var filters =module.exports.filters = config.filters || {};

      module.exports.serviceNames = Object.keys( services );
      module.exports.filterNames = Object.keys( filters );
      module.exports.widgetNames = Object.keys( widgets );
      module.exports.screenNames = Object.keys( screens );

      var screenWidgetList = module.exports.screenWidgetList = _.flatten( _.map( screens, function ( v, k ) {
        return _.flattenDeep( v );
      } ) );
      //
      // debug(screenWidgetList);
      var widgetDiff = _.difference( screenWidgetList, widgetList );
      // debug(widgetDiff)
      if ( widgetDiff.length > 0 ) {
        throw new Error( 'Screens Missing Widget Definition: ' + widgetDiff.join( ', ' ) )
      }

      // log(widgets);

      var Widget = require('./Widget.js');

      // check widgets for things
      _.forIn( widgets, function ( w, name ) {

        new Widget(name, w)

      })
    }
    //#end widget block

    if ( _.has(config,'services')){
      _.each( config.services, function(s){
        if ( _.has(s, 'engine') ){
          // standardize zone to zones
          if (_.has(s, 'engineParams.zone')){
            s.engineParams.zones = s.engineParams.zones || []
            s.engineParams.zones.push(s.engineParams.zone);
          }
        }
      })
    }

    if ( _.has(config, 'sensors')){
      _.each(config.sensors, function(s, i){
        if ( _.isNull(s.match(sensorRegex))) {
          console.warn(s, 'is not a proper sensor');
          config.sensors = _.without(config.sensors, s);
        }
      })
    }

      config.validated = true;
      debug('=========== CONFIG VALIDATE ============='.blue)

      return config;

  } catch ( e ) {
    console.error( 'Config Validation Error', e, e.stack );
  }
}
