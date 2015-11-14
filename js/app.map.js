var app = (function(parent, $, L, cartodb){
  // sets up the Leaflet Map and loads the data layer from CartoDB

  var el = parent.el;

  console.log(el);

  parent.map = {

    init : function() {
      var params = {
        center : [40.694631,-73.925028],
        minZoom : 9,
        maxZoom : 18,
        zoom : 15, 
        zoomControl : false,
        infoControl: false,
        attributionControl: true
      };

      el.map = new L.Map('map', params);
      el.baselayer.addTo(el.map);
      el.fgTest = L.featureGroup().addTo(el.map);
      app.map.getCartoDB(el.map);

      new L.Control.Zoom({ position: 'bottomright' }).addTo(el.map);    
    },

    getCartoDB : function(m) {
      // console.log(el.cartocss.taxLots);

      // cartodb data layer settings for the tax lots
      el.layerSource = {
          user_name : "chenrick",
          type : "cartodb",
          sublayers : [{
              sql : "SELECT * FROM " + el.taxLots,
              cartocss : el.cartocss.taxLots,
              interactivity: ""
          }]
      };

      // cartodb layer params
      el.cdbOptions = {
          cartodb_logo: false,
          legends: false,
          https: true,
          attributionControl: true
      };

      // create the cartodb layer
      cartodb.createLayer(m, el.layerSource, el.cdbOptions)
          .addTo(m)
          .on('done',function(layer) {
              layer.setZIndex(10); // make sure the cartodb layer is on top
              el.dataLayer = layer.getSubLayer(0);
          });
    }
  }

  return parent;

})(app || {}, jQuery, L, cartodb);