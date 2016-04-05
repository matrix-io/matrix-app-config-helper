var config = require('./config.js')

function Widget(name, obj){
  log('\n> widget init'.grey, name )
  var self = obj;
  self.name = name;

  obj = populate(obj, name);
  validate(obj);

  log('< widget done'.grey, name )
  return self;
}

module.exports = Widget;

function populate(w, name){

  // SET DEFAULTS
  if ( !_.has( w, 'type' ) ) {
    w.type = name;
    log( 'setting default type'.yellow, name + '.type =', w.type );
  }

  if ( _.has(w,'display') && !_.isString(w.display) && _.has(w, 'displayList')){
    console.log( w.name, 'display takes precedence over displayList'.yellow )
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
        log( w.name, 'defined displayList: ', d.name+'.type', d.type  )
      } else if ( !_.isUndefined(w.type) ) {
        d.type = w.type;
        log( w.name, 'set displayList type'.yellow, d.name+'.type =',d.type )
      }
    })
  }

  // Make sure all controls are valid & automap controlEventList
  if ( _.has( w, 'control' ) || _.has( w, 'controlEventList' ) ) {
    if ( _.isObject( w.control ) ) {
      if ( _.has( w, 'controlEventList' ) ) {
        log( 'control and controlEventList are both objects, defaulting to control' );
        w.controlEventList = control;
      }
    } else if ( _.isString( w.control ) ) {
      // single control
      if ( util.isControl( w.control ) ) {
        log( 'control registered:', w.name, w.control );
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
        log( 'invalid control:', w.name, w.control );
      }
    }
  }

  return w;
}

function validate(w){
  // VALIDATE OBJECT LOGIC

  if ( _.isString(w.displayList)){
    console.log('Display List is not an array or an object'.red);
  }

  // make sure data type is defined - deep display map
  _.each( w.displayList, function ( di ) {
    if ( _.has( di, 'type' ) ) {
      log( w.name, ':', di.name, '> type', di.type  )
    } else if ( !_.isUndefined(w.type) ) {
      log( w.name, 'no displayList type'.yellow, di.name+'.type =',di.type )
    }
  });

  // Lists should be arrays from populate
  if (
    (_.has(w, 'displayList') && w.displayList.length > 1 ) ||
    (_.has(w,'controlEventList') && w.controlEventList.length > 1 )
  ) {

    // if root has no layout
    if ( !_.has( w, 'layout' ) ) {
      log('no layout defined for multilayout'.red )
    }

    _.each( _.concat(w.displayList, w.controlEventList ), function(d){

      if ( _.has(d,'layout') && !util.isLayout(d.layout)){
        log('Invalid MultiLayout', d.layout);
      }
    });

  } else {
    // assume single widget, check for layout      // Make sure all layouts are valid
    if ( _.has( w.layout ) && util.isLayout( w.layout ) ) {
      log( 'valid layout', w.name, w.layout )
    } else if ( !_.isUndefined(w.layout) && !util.isLayout(w.layout) ){
      log( 'invalid layout'.red, w.name, ':', w.layout )
    }
  }


  //ensure displayList displays are valid - set display defaults == deep Defaults
  if ( _.isString( w, 'display' ) && _.has( w, 'displayList' ) ) {
    var disp = w.display;
    // is array
    _.each( w.displayList, function ( k, i ) {
      var dList = w.displayList[ i ];
      if ( _.has( dList, 'display' ) ) {
        if ( !util.isDisplay( dList.display ) ) {
          log( 'invalid display', w.name, dList.display )
        } else {
          log( 'display', w.name, dList.display )
        }
      } else {
        dList.display = disp;
        log('displayMap display', dList.type, dList.display )
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
    log( 'Services not found', w.name, serviceDiff )
  }

  // check for interface / display
  var widgetSpot = config.screenWidgetList.indexOf( w.name );
  if ( widgetSpot === -1 ) {
    log( 'widget is unused'.red)
  }



  // make sure it can display
  if ( !( _.has( w, 'display' ) || _.has( w, 'displayList' ) ||
  _.has( w, 'control' ) || _.has( w, 'controlMap' ) ) ) {

    if ( !_.has( w, 'hidden' ) || w.hidden === false ) {
      console.log( 'widget with no display or control defined'.red );
    } else {
      console.log( 'invisbility detected'.green )
    }
  }
}
