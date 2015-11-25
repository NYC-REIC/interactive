var app = (function(parent, d3){
  // d3 histograms
  var el = parent.el;

  parent.graph = {

    makeGraph : function() {

      var binsize = 1,
          minbin = 2000,
          maxbin = 2015
          numbins = (maxbin - minbin) / binsize;


      var binmargin = 0.2,
          margin = {top: 10, right: 30, bottom: 30, left: 30},
          width = 500 - margin.left - margin.right,
          height = 150 - margin.top - margin.bottom;

      var xmin = minbin - 1,
          xmax = maxbin + 1;

      var data = el.dataStore;

    }

  };

  return parent;

})(app || {}, d3);