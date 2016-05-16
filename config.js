var util = require('./helpers.js');

var debug = require('debug')('config-helper')

var dataTypeRegex = /(string|str|s|object|obj|o|float|fl|f|integer|int|i)/;

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

function validate( config ){
  debug('validate');
    try {
    util.keyCheck(config);

    debug('Name:', config.name);
    debug('Desc:', config.description);
    debug('Version:', config.configVersion);
    debug('Keywords:', config.keywords);

    // set Datatype object defaults in case of array
    if ( _.isArray(config.dataTypes) ){
      config.dataTypes = _.fromPairs(
        _.map( config.dataTypes, function(t){
        return [t, 'object']
      }))
    }

    debug('DataTypes:', config.dataTypes);

    _.each(config.dataTypes, function(t, k){
      if ( t.match(dataTypeRegex).length === 0 ) {
        console.error('Bad Data Type: %s for %s', t, k)
      }
    })

    // debug(config.widgets);
    // check that all screens are widgets
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

      config.validated = true;
      debug('=========== CONFIG VALIDATE ============='.blue)

      return config;

  } catch ( e ) {
    console.error( 'Config Validation Error', e, e.stack );
  }
}
