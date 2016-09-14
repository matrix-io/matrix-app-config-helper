var config = require('./config.js')
var _ = require('lodash')
var debug = require('debug')('config-helper-widget')
var util = require('./helpers.js')

function Widget(name, obj){
  log();
  debug('> widget init'.grey, name )
  var self = obj;
  self.name = name;

  obj = populate(obj, name);
  validate(obj);

  debug('< widget done'.grey, name )
  return self;
}

module.exports = Widget;



function populate(w, name){

  // SET DEFAULTS
  if ( !_.has( w, 'type' ) ) {
    w.type = name;
    debug( 'setting default type'.yellow, name + '.type =', w.type );
  }


  // Make single keys ( 'a,b,c' ) into array
  if ( _.isPlainObject(w.keys) ){
    // we're fine
  } else if ( _.has(w, 'keys') && _.isString(w.keys) ){
    // remove whitespace and standardize
    debug('non object keys', w.keys)
    w.keys = w.keys.split(',').map(function(s){ return s.trim().toLowerCase() });
  } else if ( _.has(w, 'key')) {
    w.keys = [ w.key ];
  } else {
    // no keys, default to value
    debug('no key defined'.yellow, name + '.keys = ["value"]')
    w.keys = [ 'value' ]
  }

  if ( _.has(w,'display') && !_.isString(w.display) && _.has(w, 'displayList')){
    debug( w.name, 'display takes precedence over displayList'.yellow )
    w.displayList = w.display;
  } else if ( !_.isString(w.display) && !_.has(w, 'displayList')  && _.has(w, 'display')) {
    // populate obj without error
    w.displayList = w.display;
  }

  if ( _.has(w, 'displayList') && !_.isArray(w.displayList)){
    // convert to array
    w.displayList = util.objIntoCollection(w.displayList)
  }

  // name the subwidgets and populate display & type if available
  if ( _.isArray(w.displayList)) {
    _.each( w.displayList, function(d, i){
      d.name = d.name || w.name+'-subwidget-'+i
      if ( _.isString( w.display ) ) {
        // apply display to all displayList children without display
        _.forIn( w.displayList, function ( d ) {
          if ( !_.has( d, 'display' ) ) {
            d.display = w.display;
          }
        } );
      }

      if ( _.has( d, 'type' ) ) {
        debug( w.name, 'defined displayList: ', d.name+'.type', d.type  )
      } else if ( !_.isUndefined(w.type) ) {
        d.type = w.type;
        debug( w.name, 'set displayList type'.yellow, d.name+'.type =',d.type )
      }
    })
  }

  // Make sure all controls are valid & automap controlEventList
  if ( _.has( w, 'control' ) || _.has( w, 'controlEventList' ) ) {
    if ( _.isObject( w.control ) ) {
      if ( _.has( w, 'controlEventList' ) ) {
        debug( 'control and controlEventList are both objects, defaulting to control' );
        w.controlEventList = control;
      }
    } else if ( _.isString( w.control ) ) {
      // single control
      if ( util.isControl( w.control ) ) {
        debug( 'control registered:', w.name, w.control );
        // apply control
        _.forIn( w.controlEventList, function ( v, k ) {
          if ( _.isString( v ) ) {
            var eventName = v;
            w.controlEventList[ k ] = {
              name: k,
              type: w.type,
              event: eventName
            };
          }
        } )
      } else {
        debug( 'invalid control:', w.name, w.control );
      }
    }
  }

  return w;
}

function validate(w){
  // VALIDATE OBJECT LOGIC

  if ( _.isString(w.displayList)){
    debug('Display List is not an array or an object'.red);
  }

  // make sure data type is defined - deep display map
  _.each( w.displayList, function ( di ) {
    if ( _.has( di, 'type' ) ) {
      debug( w.name, ':', di.name, '> type', di.type  )
    } else if ( !_.isUndefined(w.type) ) {
      debug( w.name, 'no displayList type'.yellow, di.name+'.type =',di.type )
    }
  });

  // Lists should be arrays from populate
  if (
    (_.has(w, 'displayList') && w.displayList.length > 1 ) ||
    (_.has(w,'controlEventList') && w.controlEventList.length > 1 )
  ) {

    // if root has no layout
    if ( !_.has( w, 'layout' ) ) {
      debug('no layout defined for multilayout'.red, w.name.yellow )
    }

    _.each( _.concat(w.displayList, w.controlEventList ), function(d){

      if ( _.has(d,'layout') && !util.isLayout(d.layout)){
        debug('Invalid MultiLayout', d.layout);
      }
    });

  } else {
    // assume single widget, check for layout      // Make sure all layouts are valid
    if ( _.has( w.layout ) && util.isLayout( w.layout ) ) {
      debug( 'valid layout', w.name, w.layout )
    } else if ( !_.isUndefined(w.layout) && !util.isLayout(w.layout) ){
      debug( 'invalid layout'.red, w.name, ':', w.layout )
    }
  }

  // this isn't right
    if ( _.has(w, 'display') && _.has(w, 'control') ){
      debug('dual mode: display and control'.red , w.name);
    }


  //ensure displayList displays are valid - set display defaults == deep Defaults
  if ( _.isString( w, 'display' ) && _.has( w, 'displayList' ) ) {
    var disp = w.display;
    // is array
    _.each( w.displayList, function ( k, i ) {
      var dList = w.displayList[ i ];
      if ( _.has( dList, 'display' ) ) {
        if ( !util.isDisplay( dList.display ) ) {
          debug( 'invalid display', w.name, dList.display )
        } else {
          debug( 'display', w.name, dList.display )
        }
      } else {
        dList.display = disp;
        debug('displayMap display', dList.type, dList.display )
      }
    });
  }

  // check the controls in displayList (makes more sense for user)
  _.forIn( w.displayList, function ( v, k ) {
    if ( _.has( v, 'control' ) ) {
      util.checkControl( v.control )
    }
  } )

  // TODO: Check services
  var serviceDiff = _.difference( w.services, config.serviceNames )
  if ( serviceDiff.length > 0 ) {
    debug( 'Services not found', w.name, serviceDiff )
  }

  // check for interface / display
  var widgetSpot = config.screenWidgetList.indexOf( w.name );
  if ( widgetSpot === -1 ) {
    debug( 'widget is unused'.red)
  }



  // make sure it can display
  if ( !( _.has( w, 'display' ) || _.has( w, 'displayList' ) ||
  _.has( w, 'control' ) || _.has( w, 'controlMap' ) ) ) {

    if ( !_.has( w, 'hidden' ) || w.hidden === false ) {
      debug( 'widget with no display or control defined'.red );
    } else {
      debug( 'invisbility detected'.green )
    }
  }
}
