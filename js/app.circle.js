var app = (function(parent, $, L, cartodb) {
    // the meat of the app. 
    // here we buffer the maps mid point and use that area to query the tax lot data in CartoDB.

    var el = parent.el;

    parent.circle = {
      
      // find the map's bounding box and center point
      // make some points for turf.js to calculate distance with
      getCurCenterTop : function() {
        // offset the center of the circle so it doesn't collide with the header
        var curZoom = el.map.getZoom();
        var offset = 0.001;

        // to do: make a function calculation for this...
        if (curZoom > 15 && curZoom < 17) {
          offset = 0.0005;
        } else if (curZoom >= 17) {
          offset = 0.00025;
        } else if (curZoom == 14) {
          offset = 0.002;
        } else if (curZoom == 13) {
          offset = 0.004;
        } else if (curZoom == 12) {
          offset = 0.008;
        } else if (curZoom < 12 && curZoom > 9) {
          offset = 0.016;
        }
        
        el.bounds = el.map.getBounds();
        el.center = el.map.getCenter();
        el.center.lat = el.center.lat - offset;
        el.bounds._northEast.lat = el.bounds._northEast.lat - offset;
        el.topPoint = L.latLng([el.bounds._northEast.lat, el.center.lng]);
        el.centerPoint = L.latLng([el.center.lat,el.center.lng]);
      },
      
      // this object contains chainable functions for creating the circle, updating the cartocss & data aggregation
      bufferMaker : {

        circleParams : {
          color: "#000",
          weight: 2,
          fill: false,
          clickable: false,
          className: 'leafletCircle',
          pointerEvents: null
        },

        centerToTop : function (c,t) {
          this.center = c;
          this.distance = c.distanceTo(t);
          return this;
        },

        bufferCenter : function () {
          if (this.distance && this.center) {
            // this.buffer = turf.buffer(this.center, this.distance, 'kilometers');
            this.circle = L.circle([el.center.lat, el.center.lng],(this.distance * 0.78), this.circleParams) ;
          }
          return this;
        },

        // recreate the buffer in PostGIS for the spatial query in the CartoDB table / data layer
        webMercatorCircle : function() {
          if (this.distance && this.center) {
            // SQL query for data aggergation
            this.SQLquerySUM = "SELECT (after_d_01 * 0.01) AS tax, (after_d_01 - before__01) AS profit, " +
              "council, after_doc_date as date " +
              "FROM nyc_flips_pluto_150712 WHERE ST_Within(" +
              "the_geom_webmercator, ST_Buffer(ST_Transform(ST_GeomFromText(" +
              "'Point(" + el.center.lng + ' ' + el.center.lat + ")',4326)," + "3857)," +
              (this.distance) + "))";        
            
            // SQL query for data layer cartocss update
            // we create another column called "within" that gives the data a boolean value for being in or out of the circle
            this.SQLqueryDL = "SELECT a.after_d_01, a.before__01, a.cartodb_id, a.the_geom_webmercator, a.within " +
              "FROM ( SELECT *, ST_DWithin( the_geom_webmercator, ST_Transform( ST_GeomFromText( 'Point(" +
              el.center.lng + ' ' + el.center.lat + ")', 4326), " + "3857)," + (this.distance) + ") as within " +
              "FROM " + el.taxLots + ") as a";
            
            // SQL query for grabbing neighborhoods
            this.SQLqueryHoods = "SELECT neighborhood FROM pediacities_hoods WHERE " +
              "ST_Within(the_geom_webmercator, ST_Buffer(" +
                "ST_Transform(ST_GeomFromText('Point(" + el.center.lng + ' ' + el.center.lat + ")', 4326),3857)," +
                this.distance + "))";
            
            // console.log(this.SQLqueryDL);

            // update the data layer's cartocss
            el.dataLayer.set({
              sql : this.SQLqueryDL,
              cartocss : el.cartocss["circle-query"]
            });

            // get the data for aggregation
            el.sql.execute(this.SQLquerySUM)
              .done(function(data){
                app.circle.bufferMaker.crunchData(data);
                app.circleElems();
                this.data = data;
                return this;
              });

            // grab the neighborhoods
            el.sql.execute(this.SQLqueryHoods)
              .done(function(data){
                console.log('hoods: ', data);
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
            var profit = "$" + (Math.round(el.sum) + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            var tax = "$" + (Math.round(el.tax) + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

            console.log('profit: ', profit, ' tax: ', tax);

            $('.profit').text(profit);
            $('.tax').text(tax);
        },

        // clear the current L.circle then draw the new one
        testBuffer : function () {
          if (this.distance) {
            el.fgTest.clearLayers();
            el.fgTest.addLayer(this.circle);
          }
        }
      }, // end bufferMaker

      // draws the circle
      makeBuffer : function() {
        app.circle.bufferMaker
          .centerToTop(el.centerPoint, el.topPoint)
          .bufferCenter()
          .testBuffer();
      },

      // fires the PostGIS query
      queryCDB : function() {
        app.circle.bufferMaker.webMercatorCircle();
      }

    }; // end circle

    return parent;

})(app || {}, jQuery, L, cartodb);