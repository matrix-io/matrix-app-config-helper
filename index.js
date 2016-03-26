var fs = require( 'fs' );
var yaml = require( 'js-yaml' )
var _ = require( 'lodash' )
var log = console.log;


// console.log( require('util').inspect(config, { depth: null}) )
module.exports = {
  validate: function ( w ) {
    // VALIDATE OBJECT LOGIC

    // ensure multi-widgets have layout set
    var subWidgetCount = nKey( w.displayList ) + nKey( w.controlEventMap );
    if ( subWidgetCount > 1 ) {

      // if root has no layout
      if ( !_.has( w, 'layout' ) ) {

        log( 'no layout defined for multilayout', w.name )
      }

    } else {
      // assume single widget, check for layout      // Make sure all layouts are valid
      if ( _.has( w.layout ) && isLayout( w.layout ) ) {
        log( 'valid layout', w.name, w.layout )
      } else if ( !_.isUndefined( w.layout ) ) {
        log( 'invalid layout', w.name, w.layout )
      }
    }





// convert display / displayList object to list
    if ( _.isObject( w.display ) || _.isObject( w.displayList ) ){
      log(w.name, 'displayList is an object')
      var dispList = [];
      var disp = ( _.isObject(w.display)) ? w.display : w.displayList;
      // turn display list into an object
      _.forIn( disp, function (v,k){
        v.type = v.type || k;
        dispList.push(v);
      })
      w.displayList = dispList;
    }

    //ensure displayList displays are valid - set display defaults == deep Defaults
    if ( _.isString( w, 'display' ) && _.has( w, 'displayList' ) ) {
      var disp = w.display;
      // is array
      _.each( w.displayList, function ( k, i ) {
        var dMap = w.displayList[ i ];
        if ( _.has( dMap, 'display' ) ) {
          if ( !isDisplay( dMap.display ) ) {
            log( 'invalid display', w.name, dMap.display )
          } else {
            log( 'display', w.name, dMap.display )
          }
        } else {
          dMap.display = disp;
          log('displayMap display', dmap.type, dMap.display )
        }
      })
    }

    // check the controls in displayList (makes more sense for user)
    _.forIn( w.displayList, function ( v, k ) {
      if ( _.has( v, 'control' ) ) {
        checkControl( v.control )
      }
    } )

    // TODO: Check services
    var serviceDiff = _.difference( w.services, serviceNames )
    if ( serviceDiff.length > 0 ) {
      log( 'Services not found', w.name, serviceDiff )
    }



    // SETUP TESTS
    // check for interface / display
    if ( screenWidgetList.indexOf( w.name ) > -1 ) {
      log( 'widget has screen ', w.name )
    } else {
      log( 'widget is unused in screen', w.name )
    }



    // make sure it can display
    if ( !( _.has( w, 'display' ) || _.has( w, 'displayList' ) ||
        _.has( w, 'control' ) || _.has( w, 'controlMap' ) ) ) {

      if ( !_.has( w, 'hidden' ) || w.hidden === false ) {
        console.log( 'widget with no display or control defined [:]=>', w.name );
      } else {
        console.log( 'invisbility detected on ', w.name )
      }
    }

  },
  populate: function populateConfigObject ( w, name ) {
    if ( w === null || nKey( w ) === 0 || _.isEmpty( w ) ) {
      log( name, 'is null' );

      // graciously allow existence
      w.name = name;
    }

    // take care of name
    if ( _.has( w, 'name' ) ) {
      console.log( 'Name is a reserved keyword. Use Label for text.' )
      return;
    } else {
      //add name attrib
      log( name, 'named' )
      w.name = name;
    }

    // SET DEFAULTS
    if ( !_.has( w, 'type' ) ) {
      w.type = name;
      log( 'default', name + '.type ==', w.type );
    }


    // check multi displays defined in displayList or display, automap display
    if ( _.has( w, 'displayList' ) || _.isObject( w.display ) ) {
      if ( _.isObject( w.display ) ) {
        // default displayList to display
        if ( !_.isEmpty( w.displayList ) ) {
          console.log( 'display takes precedence over display map: ', w.name )
        }
        w.displayList = w.display;
      } else if ( _.isString( w.display ) ) {
        // apply display to all displayList children without display
        _.forIn( w.displayList, function ( d ) {
          if ( !_.has( d, 'display' ) ) {
            d.display = w.display;
          }
        } );
      }
    }


    // Make sure all controls are valid & automap controlEventMap
    if ( _.has( w, 'control' ) || _.has( w, 'controlEventMap' ) ) {
      if ( _.isObject( w.control ) ) {
        if ( _.has( w, 'controlEventMap' ) ) {
          log( 'contrl and controlEventMap are both objects, defaulting to control' );
          w.controlEventMap = control;
        }
      } else if ( _.isString( w.control ) ) {
        // single control
        if ( isControl( w.control ) ) {
          log( 'control registered:', w.name, w.control );
          // apply control
          _.forIn( w.controlEventMap, function ( v, k ) {
            if ( _.isString( v ) ) {
              var eventName = v;
              w.controlEventMap[ k ] = {
                name: k,
                type: w.type,
                event: eventName
              };
            }
          } )
        } else {
          log( ' invalid control:', w.name, w.control );
        }
      }
    }


    // make sure data type is defined - deep display map
    _.each( _.keys( w.displayList ), function ( dk ) {
      // log(dk, w.display)
      var dv = w.displayList[ dk ];
      dv.name = dv.name || dk;
      if ( _.has( dv, 'type' ) ) {
        log( w.name, 'has display type', dv.type  )
      } else {
        dv.type = w.type;
        log( w.name, 'set type', dv.type )
      }
    } );
  }
}


try {

  var config = yaml.safeLoad( fs.readFileSync( 'config.yaml' ) );
  // TODO Config Validation

  // console.log(config);
  // check that all screens are widgets
  var widgetList = Object.keys( config.widgets );

  var screens = config.screens;
  var widgets = config.widgets;
  var services = config.services;
  var filters = config.filters;

  var serviceNames = Object.keys( services );
  var filterNames = Object.keys( filters );
  var widgetNames = Object.keys( widgets );
  var screenNames = Object.keys( screens );

  var screenWidgetList = _.flatten( _.map( screens, function ( v, k ) {
    return _.flattenDeep( v );
  } ) );
  //
  // console.log(screenWidgetList);
  var widgetDiff = _.difference( screenWidgetList, widgetList );
  // console.log(widgetDiff)
  if ( widgetDiff.length > 0 ) {
    throw new Error( 'Screens Missing Widget Definition: ' + widgetDiff.join( ', ' ) )
  }

  // empty key checklist to parse widget status
  // widgets : { widget1 : false, widget2: false, ... }
  var widgetCheckList = _.mapValues( widgets, function () {
    return false
  } );
  var widgetTests = {};

  // easy on the brain
  widgetTests.type = widgetCheckList;
  widgetTests.usage = widgetCheckList;
  widgetTests.viz = widgetCheckList;

  // log(widgets);

  // check widgets for things
  _.forIn( widgets, function ( w, name ) {

      module.exports.populate( w, name )




      module.exports.validate( w );

    } )
    // Make sure all displays are valid
  function checkControl( d ) {
    if ( isControl( d ) ) {
      log( 'control', d )
    } else {
      log( 'invalid control', d )
    }
  }
  // Make sure all displays are valid
  function checkDisplay( d ) {
    if ( isDisplay( d ) ) {
      log( 'display', d )
    } else {
      log( 'invalid display', d )
    }
  }
  // Make sure all filters are valid

  function isDisplay( d ) {
    var ds = [ 'line', 'bar', 'list', 'digit', 'list-group',
   'gauge', 'list-details', 'indicator', 'radar', 'heat-map',
    'map', 'pie-chart', 'label' ]

    return ( ds.indexOf( d ) > -1 )
  }

  function isControl( c ) {
    var cs = [ 'input', 'keyboard', 'button', 'switch', 'range', 'x', 'y',
  'radial', 'radio', 'select', 'video', 'audio', 'label', 'picture'
   , 'upload', 'joystick' ]

    return ( cs.indexOf( c ) > -1 )

  }

  function isLayout( l ) {
    var ls = [ 'overlap', 'grid', 'stack', 'books', 'left', 'centered', 'right', 'cross' ]

    return ( ls.indexOf( c ) > -1 )
  }
  // tests built

  function mapTruth( v, k ) {
    var o = {};
    o[ k ] = ( v === true )
    return o;
  }

  function nKey( obj ) {
    if ( _.isUndefined( obj ) ) {
      return 0
    } else
    if ( _.isString( obj ) ) {
      return 1
    } else {
      return Object.keys( obj ).length
    }
  }


} catch ( e ) {
  console.error( 'Config Validation Error', e, e.stack );
}
