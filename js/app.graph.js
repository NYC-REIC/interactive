var app = (function(parent, d3){
  // d3 histograms
  var el = parent.el;

  parent.graph = {

    makeGraph : function(data) {

      // helper function to grab date object from date string
      var formatDate = d3.time.format("%Y-%m-%d");

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

      // create an array to store our histogram's data
      histdata = new Array(numbins);
      
      for (var i = 0; i < numbins; i++) {
          histdata[i] = { numFlips: 0, totalProfit: 0 };
      }

      // group our data into bins, one for each year
      data.forEach(function(d){
        // get integer year of d
        var year = formatDate.parse(d.date).getFullYear();
        // put into appropriate position in array for corresponding bin
        var bin = year - minbin;

        if ((bin.toString() !== "NaN") && (bin < histdata.length)) {
          histdata[bin].numFlips += 1;
          histdata[bin].totalProfit += d.profit;
        }

      });

      console.log(histdata);

      // var x = d3.scale.linear()
      //     .domain([minbin, maxbin])
      //     .range([0, width]);

      // var data = d3.layout.histogram()
      //     .bins(x.ticks(numbins))
      //     (values);

    }

  };

  return parent;

})(app || {}, d3);