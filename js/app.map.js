var app = (function(parent, $, L, cartodb){
  // sets up the Leaflet Map and loads the data layer from CartoDB

  var el = parent.el;

  parent.map = {

    init : function() {
      var params = {
        center : [40.694631,-73.925028],
        minZoom : 9,
        maxZoom : 17,
        zoom : 14, 
        zoomControl : false,
        infoControl: false,
        attributionControl: true
      };

      el.baselayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',{
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
          opacity: 0.5,
          detectRetina: true
        });
      
      el.map = new L.Map('map', params);
      el.hash = new L.Hash(el.map);
      el.baselayer.addTo(el.map);
      el.fgTest = L.featureGroup().addTo(el.map);
      app.map.getCartoDB(el.map);

      new L.Control.Zoom({ position: 'topright' }).addTo(el.map);    
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
              app.circle.queryCDB();  // once the CartoDB layer is loaded, query it using the circle
          });
    },

    props: {
      zoom : null,
      hoodRatio : function(zoom) {
        // determine how much overlapp between the circle & neighborhood's polygon
        // to write a neighborhood name to the UI
        // hood names should only show up >= zoom 14
        var ratio;
        
        switch (zoom) {
          case 14:
            ratio = 0.5;
            break;
          case 15:
            ratio = 0.2;
            break;
          case 16:
            ratio = 0.01;
            break;
          case 17:
            ratio = 0.0001;
            break;
          default:
            ratio = 1;
        }

        return ratio;
      }
    }
  }

  return parent;

})(app || {}, jQuery, L, cartodb);