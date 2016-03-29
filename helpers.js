var _ = require('lodash')
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
  var ls = [ 'overlap', 'grid', 'stack', 'books', 'left', 'centered', 'right', 'cross','columns','rows']

  return ( ls.indexOf( l ) > -1 )
}
// tests built

function isFormat( f ){
  var fs = [ 'round', 'percent', 'fixed', 'avg', 'mean', 'max', 'min', 'count' ];

  return (fs.indexOf(f) > -1 )
}

// Make sure all displays are valid
function checkControl( d ) {
  if ( isControl( d ) ) {
    console.log( 'control', d )
  } else {
    console.log( 'invalid control', d )
  }
}
// Make sure all displays are valid
function checkDisplay( d ) {
  if ( isDisplay( d ) ) {
    console.log( 'display', d )
  } else {
    console.log( 'invalid display', d )
  }
}

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

// splits object by key into an array of objects
function objIntoArray(obj){
  var a = [];
  for (var o in obj){
    var o2 = {};
    o2[o] = obj[o];
    a.push(o2);
  }
  return a;
}

// moves array of keyed objects into a single
function collectionIntoObj(a){
  var o = {};
  var usedKeys = [];
  for ( var i in a ){
    for ( var j in a[i] ){
      // iterate through objects, add to parent
      o[j] = a[i][j];
      if ( usedKeys.indexOf(j) > -1 ){
        console.warn('Config Key Overwrite ', j);
      }
      usedKeys.push(j);
    }
  }
  return o;
}

module.exports = {
  checkControl: checkControl,
  checkDisplay: checkDisplay,
  isDisplay: isDisplay,
  isControl: isControl,
  isLayout: isLayout,
  mapTruth: mapTruth,
  nKey: nKey,
  objIntoArray: objIntoArray,
  collectionIntoObj: collectionIntoObj
}
