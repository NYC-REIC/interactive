var app = (function(parent, $, L, cartodb) {
    // the meat of the app. 
    // here we buffer the maps mid point and use that area to query the tax lot data in CartoDB.

    var el = parent.el;
    var queried = false;

    parent.circle = {
      
      // find the map's bounding box and center point
      // make some Leaflet points to calculate distance with
      measureBBox : function() {
        // offset the center of the circle so it doesn't collide with the header text
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
          offset = 0.0025;
        } else if (curZoom == 12) {
          offset = 0.003;
        } else if (curZoom < 12 && curZoom > 9) {
          offset = 0.0035;
        }
        
        el.bounds = el.map.getBounds();
        el.center = el.map.getCenter();
        el.center.lat = el.center.lat - offset;
        el.bounds._northEast.lat = el.bounds._northEast.lat - offset;
        el.topPoint = L.latLng([el.bounds._northEast.lat, el.center.lng]);
        el.eastPoint = L.latLng([el.center.lat, el.bounds._northEast.lng]);
        el.centerPoint = L.latLng([el.center.lat,el.center.lng]);
      },
      
      // this object contains chainable functions for creating the circle, 
      // updating the cartocss & data aggregation
      // to do: could probably separate this out into other objects within app.circle ...
      bufferMaker : {

        // styling for the circle UI which is an instance of L.circle()
        circleParams : {
          color: "#000",
          weight: 2,
          fill: false,
          clickable: false,
          className: 'leafletCircle',
          pointerEvents: null
        },

        // detect which distance is greater: center to top or center to side of map
        // to help with making the app mobile friendly
        widthVsHeight: function() {
          var distanceX = el.centerPoint.distanceTo(el.eastPoint),
                distanceY = el.centerPoint.distanceTo(el.topPoint);
          if (distanceX > distanceY) {
            console.log('map width greater than height');
            return distanceY;
          } else {
            console.log('map height greater than width')
            return distanceX;
          }
        },

        centerToTop : function (c,t) {
          this.center = c;
          this.distance = c.distanceTo(t);
          return this;
        },

        bufferCenter : function () {
          if (this.distance && this.center) {
            this.circle = L.circle([el.center.lat, el.center.lng],(this.distance * 0.78), this.circleParams) ;
          }
          return this;
        },

        webMercatorCircle : function() {
          // spatially query the CartoDB data layers using PostGIS, then 
          // update CartoCSS, aggregate data, make graphs, write to DOM, etc.
          
          if (this.distance && this.center) {
            
            // SQL query for data aggergation
            this.SQLquerySUM = "SELECT (after_d_01 * 0.01) AS tax, (after_d_01 - before__01) AS profit, " +
              "council, borocode, after_doc_date as date " +
              "FROM nyc_flips_pluto_150712 WHERE ST_Within(" +
              "the_geom_webmercator, ST_Buffer(ST_Transform(ST_GeomFromText(" +
              "'Point({{lng}} {{lat}})',4326)," + "3857)," +
              "{{distance}}))";        
            
            // SQL query for data layer's cartocss update
            // we create another column called "within" that gives the data a boolean value for being in or out of the circle
            this.SQLqueryDL = "SELECT a.after_d_01, a.before__01, a.cartodb_id, a.the_geom_webmercator, a.within " +
              "FROM ( SELECT *, ST_DWithin( the_geom_webmercator, ST_Transform( ST_GeomFromText( 'Point(" +
              el.center.lng + ' ' + el.center.lat + ")', 4326), " + "3857)," + (this.distance) + ") as within " +
              "FROM " + el.taxLots + ") as a";
            
            // SQL query for grabbing neighborhood polygons that overlap with the circle
            // only grab the hood names for polygons that have 50% or more of their area within the circle
            this.SQLqueryHoods = "SELECT neighborhood FROM pediacities_hoods, " + 
              "ST_Buffer(ST_Transform(ST_GeomFromText('Point({{lng}} {{lat}})',4326),3857),{{distance}}) as buffer " +
              "WHERE ST_Intersects(the_geom_webmercator, buffer) " +
              "AND (ST_Area(ST_Intersection(the_geom_webmercator, buffer)) / " + 
              "ST_Area(the_geom_webmercator)) >= {{ratio}}";
            
            // console.log(this.SQLqueryHoods);

            // update the data layer's cartocss
            el.dataLayer.set({
              sql : this.SQLqueryDL,
              cartocss : el.cartocss["circle-query"]
            });

            // get the data for aggregation
            el.sql.execute(this.SQLquerySUM,{
              lng: el.center.lng,
              lat: el.center.lat,
              distance: this.distance
            })
              .done(function(data){
                el.dataStore = data.rows.slice();
                app.circle.bufferMaker.crunchData(data);
                app.circleElems();
                app.graph.main(el.dataStore);
                this.data = data;
                return this;
              });

            // grab the neighborhood names, but only for zooms >= 13
            if (app.map.props.zoom >= 14) {
              el.sql.execute(this.SQLqueryHoods,{
                lng: el.center.lng,
                lat: el.center.lat,
                distance: this.distance,
                ratio: app.map.props.hoodRatio(el.map.getZoom())
              })
                .done(function(data){
                  // console.log('hoods: ', data);
                  app.circle.bufferMaker.writeHoods(data);
                });
            }

          }
          return this;
        },

        // helper function, uses lodash to sum rows returned from CDB query
        crunchData : function(data) {
            // console.log('crunching data: ', data);
 
            el.sum = _.sum(el.dataStore, function(obj) { return obj.profit; });
            el.tax = _.sum(el.dataStore, function(obj) { return obj.tax; });

            // if the map zoom is less than z13 write borough names to the circle UI
            if (app.map.props.zoom < 14) {
              var borocodes = _.chain(el.dataStore)
                .pluck('borocode')
                .value();

              app.circle.bufferMaker.calcBoroughs(borocodes);

            }

            // grab unique council #'s within the circle
            el.councils = _.chain(el.dataStore)
              .pluck('council')
              .unique()
              .sortBy()
              .value();

            // credit: http://stackoverflow.com/questions/17563677/convert-javascript-number-to-currency-format-but-without-or-any-currency-sym
            var profit = "$" + (Math.round(el.sum) + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            var tax = "$" + (Math.round(el.tax) + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

            // console.log('profit: ', profit, ' tax: ', tax, ' councils: ', el.councils, ' borocodes: ', unique_borocodes);

            $('.circle .profit').text(profit);
            $('.circle .tax').text(tax);
        },

        // find out our borough codes
        calcBoroughs : function(borocodes) {
          // we don't want to write a borough name to the DOM if there are very little tax lots in the circle
          // so only write it if the borocode value makes up 1% or more of the total values in the array
          
          // to store total counts for each borough 
          var bcount = {
                "mn" : 0, 
                "bx" : 0, 
                "bk" : 0,
                "qn" : 0
              },
            len = borocodes.length,
            toWrite = []; // array to hold final borocodes to write to the DOM

          // console.log('borocodes.length', borocodes.length);

          borocodes.forEach(function(el,i,arr){
            // tally up our boroughs!
            if (el === 1) {
              bcount.mn += 1;
            } else if (el === 2) {
              bcount.bx += 1;
            } else if (el === 3) {
              bcount.bk += 1;
            } else if (el === 4) {
              bcount.qn += 1;
            }

            // on the last loop find out if our totals match our criteria
            if (i === len - 1) {
              _.forIn(bcount, function(v, k){
                // console.log(k,v);                
                if (v >= (len * 0.01)) {
                  toWrite.push(k)
                } 
              });
            }
          });

          // console.log('toWrite: ', toWrite);

          // write our final borocodes to the DOM!
          app.circle.bufferMaker.writeBoroughs(toWrite);
        },

        // helper fn to translate borough code to corresponding string
        // originally wrote this because I was dealing with numeric codes
        // probably is no longer necessary
        getBorough : function(x) {
          var borough;

          switch(x) {
            case ("mn"):
              borough = "Manhattan";
              break;
            case ("bx"):
              borough = "Bronx";
              break;
            case ("bk"):
              borough = "Brooklyn";
              break;
            case ("qn"):
              borough = "Queens";
              break;
            default:
              borough = "";
          }

          return borough;
        },

        // write borough names to the UI
        writeBoroughs : function(data) {

          if (data.length) {
            var boroughs = "";
            
            data.forEach(function(el,i,arr){
              
              boroughs += app.circle.bufferMaker.getBorough(el);
              
              if (i<arr.length -1){
                boroughs += ", ";
              }

            });

            $('h4.hoods.list').html(boroughs);
            $('h4.hoods').css("display","block");

          } else {
            app.circle.bufferMaker.clearHoods();
          }

        },

        // helper function to write neighborhoods to the map
        writeHoods : function(data) {
          var hoodNames = "";
          el.hoods = data.rows.slice();

          if (el.hoods.length) {

            el.hoods.forEach(function(d,i,arr){
              if (i === arr.length -1) {
                hoodNames += d.neighborhood;
              } else {
                hoodNames += d.neighborhood + ", "  
              }
            });

            $('h4.hoods.list').html(hoodNames);
            $('h4.hoods').css("display","block");
          
          } else {
            app.circle.bufferMaker.clearHoods();
          }

        },

        clearHoods : function() {
            $('h4.hoods.list').html("");
            $('h4.hoods').css("display","none");
        },

        // clear the current L.circle then draw the new one
        // this makes it appear as if the circle is always staying in the center of the screen
        testBuffer : function () {
          if (this.distance) {
            el.fgTest.clearLayers();
            el.fgTest.addLayer(this.circle);
          }
        }
      }, // end bufferMaker

      // draws the circle UI
      makeBuffer : function() {
        app.circle.bufferMaker
          .centerToTop(el.centerPoint, el.topPoint)
          .bufferCenter()
          .testBuffer();

        if (!queried) {
          console.log('no query yet');
          queried = true;
        }
      },

      // fires the CartoDB PostGIS queries
      queryCDB : function() {
        app.circle.bufferMaker.webMercatorCircle();
      }

    }; // end circle

    return parent;

})(app || {}, jQuery, L, cartodb);