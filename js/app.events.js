var app = (function(parent) {
  
  // the app's event listeners

  var el = parent.el;

  parent.eventListeners = function() {

    // only do the PostGIS query when the map has stopped panning or zooming
    // to prevent too many CDB SQL API requests from being made.
    el.map.on('moveend', function(){
      console.log('map moved');
      var zoom = el.map.getZoom();
      console.log('map zoom level: ', zoom);
      
      if (zoom > 10 ) {
        app.circle.getCurCenterTop();
        app.circle.queryCDB();
      }
      
    });

    // we redraw the circle whenever the map is panning
    // perhaps doing this with L.circle isn't the best way to go
    //  as it stops drawing the circle when currently drawn tiles run out...
    el.map.on('move', function(){
      var zoom = el.map.getZoom();
      if (zoom >10) {
        app.circle.getCurCenterTop();
        app.circle.makeBuffer();
      }
    })
  };

  return parent;

})(app || {});