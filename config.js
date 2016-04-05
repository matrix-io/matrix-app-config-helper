
module.exports = {
  read: function( fileName ){
    fileName = fileName || 'config.yaml';

    try {

      var config = yaml.safeLoad( fs.readFileSync(fileName) );

      console.log('Name:', config.name);
      console.log('Desc:', config.description);
      console.log('Keywords:', config.keywords);
      console.log('Images:', config.images);


      // console.log(config.widgets);
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
      // console.log(screenWidgetList);
      var widgetDiff = _.difference( screenWidgetList, widgetList );
      // console.log(widgetDiff)
      if ( widgetDiff.length > 0 ) {
        throw new Error( 'Screens Missing Widget Definition: ' + widgetDiff.join( ', ' ) )
      }

      // log(widgets);

      // check widgets for things
      _.forIn( widgets, function ( w, name ) {

          new Widget(name, w)

        })


    } catch ( e ) {
      console.error( 'Config Validation Error', e, e.stack );
    }
    console.log('=========== YAY ============='.blue)
  }

}
