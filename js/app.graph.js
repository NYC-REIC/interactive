var app = (function(parent, d3){
  // d3 histograms
  var el = parent.el;

  parent.graph = {

    parseData : function(attr) {
      // returns an array of arrays with only the formmatted date object and attribute values

      var toReturn = [];

      var data = _.chain(el.dataStore)
          .sortBy("date")
          .value();

      // call like formatDate.parse("2015-12-08");
      var formatDate = d3.time.format("%Y-%m-%d");

      var dates = _.chain(data)
          .pluck("date")
          .map(formatDate.parse)
          .value()

      var values = _.chain(data)
          .pluck(attr)
          .value();

      toReturn = _.zip(dates,values);

      return toReturn;

    },

    makeGraph : function() {

      var binsize = 1,
          minbin = 2003,
          maxbin = 2015
          numbins = (maxbin - minbin) / binsize;


      var binmargin = 0.2,
          margin = {top: 10, right: 30, bottom: 30, left: 30},
          width = 500 - margin.left - margin.right,
          height = 150 - margin.top - margin.bottom;

      var xmin = minbin - 1,
          xmax = maxbin + 1;

      var x = d3.scale.linear()
          .domain([minbin, maxbin])
          .range([0, width]);

      var data = d3.layout.histogram()
          .bins(x.ticks(numbins))
          (values);

    }

  };

  return parent;

})(app || {}, d3);