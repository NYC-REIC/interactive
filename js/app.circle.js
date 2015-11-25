var app = (function(parent, $, L, cartodb, turf) {
    // the meat of the app. 
    // here we buffer the maps mid point and use that area to query the tax lot data in CartoDB.

    var el = parent.el;

    parent.circle = {
      
      // find the map's bounding box and center point
      // make some points for turf.js to calculate distance with
      getCurCenterTop : function() {
        
        el.bounds = el.map.getBounds();
        el.center = el.map.getCenter();
        el.center.lat = el.center.lat;
        el.bounds._northEast.lat = el.bounds._northEast.lat;
        el.topPoint = turf.point([el.center.lng, el.bounds._northEast.lat]);
        el.centerPoint = turf.point([el.center.lng, el.center.lat]);

        var SQLqueryDistance = "SELECT " +
          "ST_Distance_Sphere(" + 
            "ST_GeomFromText('Point(" + el.center.lng + ' ' + el.center.lat + ")', 4326)," +
            "ST_GeomFromText('Point(" + el.center.lng + ' ' + el.bounds._northEast.lat + ")', 4326)" +
          ") as distance";

        el.sql.execute(SQLqueryDistance)
          .done(function(data) {
            var lng = el.center.lng;  
            app.circle.distance2 = data.rows[0].distance;
            console.log(app.circle.distance2);
          });

        // convert center and top points to pixel coordinates
        // var layerPointCenter = el.map.latLngToLayerPoint([el.center.lat, el.center.lng]),
        //      layerPointTop = el.map.latLngToLayerPoint([el.bounds._northEast.lat, el.center.lng]);

        // // now calculate how big the circle is in pixels for positioning the UI elements     
        // el.circleRadius = layerPointCenter.distanceTo(layerPointTop);

        // console.log('layerPointCenter: ', layerPointCenter, ' layerPointTop: ', layerPointTop, 'distance: ', el.circleRadius);
      },
      
      // this object contains chainable functions for creating the circle, updating the cartocss & data aggregation
      bufferMaker : {

        // params to pass to the circle UI
        circleParams : {
          color: "#fff",
          weight: 2,
          fill: false,
          clickable: false,
          pointerEvents: null
        },

        centerToTop : function (c,t) {
          // measures center of map to top of map using Turf distance
          // value returned by Turf is different than ST_Distance()
          this.center = c;
          // reduce the size of the circle so it doesn't take up the whole map area
          // should figure out a way to do this more dynamically
          this.distance = turf.distance(c,t,'kilometers') * 0.77; 

          return this;
        },

        bufferCenter : function () {
          // creates the visual circle UI element using L.circle()
          if (app.circle.distance2 && app.el.center) {
            // this.buffer = turf.buffer(this.center, app.circle.distance2, 'kilometers');
            this.circle = L.circle([el.center.lat, el.center.lng],(app.circle.distance2 * 1000), this.circleParams) ;
          }
          return this;
        },

        // recreate the buffer in PostGIS for the spatial query in the CartoDB table / data layer
        webMercatorCircle : function() {
          if (this.distance2 && app.el.center) {
            // SQL query for data aggergation
            this.SQLquerySUM = "SELECT (after_d_01 * 0.01) AS tax, (after_d_01 - before__01) AS profit, " +
              "council, after_doc_date as date " +
              "FROM nyc_flips_pluto_150712 " + 
              "WHERE ST_Within(" +
                "the_geom_webmercator, " +
                "ST_Buffer(ST_Transform(ST_GeomFromText(" +
                  "'Point(" + el.center.lng + ' ' + el.center.lat + ")',4326), 3857)," +
                    "ST_Distance_Sphere(" + 
                      "ST_GeomFromText('Point(" + el.center.lng + ' ' + el.center.lat + ")', 4326)," +
                      "ST_GeomFromText('Point(" + el.center.lng + ' ' + el.bounds._northEast.lat + ")', 4326)" +
                    ")" + 
                ")" + 
              ")";
            
            // SQL query for data layer cartocss update
            // we create another column called "within" that gives the data a boolean value for being in or out of the circle
            this.SQLqueryDL = "SELECT a.after_d_01, a.before__01, a.cartodb_id, a.the_geom_webmercator, a.within " +
              "FROM ( SELECT *, " + 
                     "ST_DWithin( " + 
                         "the_geom_webmercator, " + 
                         "ST_Transform( ST_GeomFromText( 'Point(" + el.center.lng + ' ' + el.center.lat + ")', 4326), " + "3857)," + 
                         "ST_Distance_Sphere(" + 
                            "ST_GeomFromText('Point(" + el.center.lng + ' ' + el.center.lat + ")', 4326)," +
                            "ST_GeomFromText('Point(" + el.center.lng + ' ' + el.bounds._northEast.lat + ")', 4326)" +
                         ")" + 
                      ") as within " +
                "FROM " + el.taxLots + ") as a"   
            
            console.log(this.SQLquerySUM);

            // update the data layer's cartocss
            el.dataLayer.set({
              sql : this.SQLqueryDL,
              cartocss : el.cartocss["circle-query"]
            });

            // get the data for aggregation
            el.sql.execute(this.SQLquerySUM)
              .done(function(data){
                  app.circle.bufferMaker.crunchData(data);
                  this.data = data;
                  return this;
              });
          }
          return this;
        },

        // helper function, uses lodash to do sum rows returned from CDB query
        crunchData : function(data) {
            console.log('crunching data: ', data);

            el.dataStore = data.rows.slice(); 
            el.sum = _.sum(el.dataStore, function(obj) { return obj.profit; });
            el.tax = _.sum(el.dataStore, function(obj) { return obj.tax; });

            // credit: http://stackoverflow.com/questions/17563677/convert-javascript-number-to-currency-format-but-without-or-any-currency-sym
            var profit = "$" + (el.sum.toFixed(2) + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            var tax = "$" + (el.tax.toFixed(2) + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

            console.log('profit: ', profit, ' tax: ', tax);

            $('.profit').text(profit);
            $('.tax').text(tax);
        },

        // clear the current L.circle then draw the new one
        testBuffer : function () {
          if (this.circle) {
            console.log('testBuffer called');
            el.fgTest.clearLayers();
            el.fgTest.addLayer(this.circle);
          }
        }
      }, // end bufferMaker

      // draws the circle
      makeBuffer : function() {
        app.circle.bufferMaker
          .bufferCenter()
          .testBuffer();
      },

      // fires the PostGIS query
      queryCDB : function() {
        app.circle.bufferMaker.webMercatorCircle();
      }

    }; // end circle

    return parent;

})(app || {}, jQuery, L, cartodb, turf);