var app = (function(parent,$){
  // use the URL hash to store a BBL from a tax lot that is clicked on by the user
  // this code was done by Ingrid Burrington (@LifeWinning)

  var el = parent.el;

  console.log(el);

  parent.splitHash = function() {
    el.hashurl = el.url.split('#');
  }

  parent.bblHash = function() {
    if (el.hashurl[1]){
      divid = '_'+el.hashurl[1].toString()
      // console.log(divid)
      // viewdiv = document.getElementById(divid)
      f = el.sql.execute("SELECT * FROM nyc_flips WHERE (bbl ="+el.hashurl[1]+")").done(function(geojson){
        // I cant' believe I'm doing this 
        flipLL = []
        center = geojson.features[0].geometry.coordinates[0]
        for (var i = 0; i < center.length; i++) {
          for (var j = 0; j < center[i].length; j++) {
             arr = []
             newLat = center[i][j][1]
             newLon = center[i][j][0]
             arr.push(newLat, newLon)
             flipLL.push(arr)
          };
        };
        get_center = L.polygon(flipLL)
        //super-sketch thing for dealing with json lon/lat vs leaflet lat/lon
        
        geom_center = get_center.getBounds().getCenter()
         map = new L.Map("map",{
          zoomControl: false,
          center: geom_center,
          zoom: 19
        })
        baselayer.addTo(map)
        buildings = L.geoJson(geojson, {
          style : {
            'fillColor': '#FA98D6',
            'fillOpacity': 1,
            'stroke': 0
          },
          onEachFeature: function(feature, layer){
            layer.on({click: function(e){
              window.location.hash = feature.properties.bbl
             }})
            prev_bldg = layer
            all_the_things.push(feature.properties.bbl)
          }
        })
        buildings.addTo(ff)
        ff.addTo(map)
        app.map.zoomChangeLayers(map)
        app.map.getBuildingsByBB(map)
        map.on('moveend', function(){
          app.map.getBuildingsByBB(map)   
        })

      })
    } else {
      app.map.zoomChangeLayers(el.map)
      el.map.on('moveend', function(){
         app.map.getBuildingsByBB(el.map)   
      });
    }
  }

  return parent;

})(app || {}, jQuery);