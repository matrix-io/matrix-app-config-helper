var fs = require( 'fs' );
var yaml = require( 'js-yaml' )
var _ = require( 'lodash' )
log = console.log;

try {

  var config = yaml.safeLoad( fs.readFileSync( 'config.yaml' ) );
  // TODO Config Validation

  // console.log(config);
  // check that all screens are widgets
  var widgetList = Object.keys( config.widgets );

  var screens = config.screens;
  var widgets = config.widgets;

  var screenWidgetList = _.flatten( _.map( screens, function ( v, k ) {
    return _.flattenDeep( v );
  } ) );
  //
  // console.log(screenWidgetList);
  var widgetDiff = _.difference( screenWidgetList, widgetList );
  // console.log(widgetDiff)
  if ( widgetDiff.length > 0 ) {
    throw new Error( 'Missing Widget Definition: ' + widgetDiff.join( ', ' ) )
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

      if ( w === null || nKey( w ) === 0 || _.isEmpty( w ) ) {
        log( name, 'is null' )

        // graciously allow existence
        w.name = name;
      }

      if ( _.has( w, 'name' ) ) {
        console.log( 'Name is a reserved keyword. Use Label for text.' )
        return;
      } else {
        //add name attrib
        log( name, 'named' )
        w.name = name;
      }

      // make sure data type is defined
      if ( _.has( w, 'type' ) || _.has( w, 'displayMap.type' ) ) {
        widgetTests.type[ name ] = true;
      }

      // check for interface / display
      if ( screenWidgetList.indexOf( w ) > -1 ) {
        widgetTests.usage[ name ] = true;
      }

      // make sure it can display
      if ( !( _.has( w, 'display' ) || _.has( w, 'displayMap' ) ||
          _.has( w, 'control' ) || _.has( w, 'controlMap' ) ) ) {

        if ( !_.has( w, 'hidden' ) || w.hidden === false ) {
          console.log( 'widget with no display or control defined [:]=>', w.name );
          widgetTests.viz[ name ] = true;
        } else {
          console.log( 'invisbility detected on ', w.name )
        }
      }

      // ensure multi-widgets have layout set
      if ( nKey( w.display ) + nKey( w.displayMap ) + nKey( w.control ) > 1 ) {

        // if root has no layout
        if ( !_.has( w, 'layout' ) ) {

          log( 'no layout defined for multilayout', w.name )
        }

      }

      // check multi displays defined in displayMap or display
      if ( _.has( w, 'displayMap' ) || _.isObject( w.display ) ) {
        if ( _.isObject( w.display ) ) {
          // default displayMap to display
          if ( !_.isEmpty( w.displayMap ) ) {
            console.log( 'display takes precedence over display map: ', w.name )
          }
          w.displayMap = w.display;
        } else if ( _.isString( w.display ) ) {
          // apply display to all displayMap children without display
          _.forIn( w.displayMap, function ( d ) {
            if ( !_has( d, 'display' ) ) {
              d.display = w.display;
            }
          } );
        }
      }


      //TODO: auto populate display to displayMap children
      //ensure valid Displays
      if ( _.has( w, 'display' ) && _.has( w, 'displayMap' ) ) {
        var disp = w.display;
        _.forIn( w.displayMap, function ( v, k ) {
          var dMap = w.displayMap[ k ];
          if ( _.has( dMap, 'display' ) ) {

            checkDisplay( dMap.display );

            // override
            return;
          } else {
            log( 'hardcoding', k, 'display as', disp )
            dMap.display = disp;
          }
        } )
      }

  })
    // Make sure all displays are valid
  function checkDisplay( d ) {
    if ( isDisplay( d ) ) {
      log( 'display', d )
    } else {
      log( 'no display', d )
    }
  }
  // Make sure all controls are valid
  // Make sure all layouts are valid
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
   , 'upload' ]

    return ( cs.indexOf( c ) > -1 )

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

  _.forIn( widgetTests.type, function ( v, k ) {
    if ( v === false ) {
      log( 'no type. setting defaults [:]=>', k + '.type', '=', k )
        //enable type defaults based on key name
      if ( _.has( widgets, k ) ) {
        widgets[ k ].type = k;
      }
    }
  } );


} catch ( e ) {
  console.error( 'Config Validation Error', e, e.stack );
}
