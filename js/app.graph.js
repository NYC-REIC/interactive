var app = (function(parent, d3){
  // for generating the d3 histogram
  
  var el = parent.el;

  // d3 local variables
  var binsize = 1,
      minbin = 2003,
      maxbin = 2015
      numbins = (maxbin - minbin) / binsize;

  var graphRect = d3.select('.graph.ui').node().getClientRects();
      graphHeight = graphRect[0].height,
      graphWidth = graphRect[0].width;

  var binmargin = 0.2,
      margin = {top: 10, right: 20, bottom: 40, left: 100},
      width = graphWidth - margin.left - margin.right,
      height = graphHeight - margin.top - margin.bottom;

  var xmin = minbin - 1,
      xmax = maxbin + 1;

  // var x, x2, y, xAxis, yAxis, svg, bar;

  // object to store graph properites
  function Params(container, key, label, marginLeft) {
    this.container = container;
    this.key = key;
    this.label = label;
    this.x = null;
    this.x2 = null;
    this.xAxis = null;
    this.yAxis = null;
    this.svg = null;
    this.bar = null;
    this.marginLeft = marginLeft;
    this.made = false;
  };

  // graphs one and two
  var a = new Params('.graph.flips', 'numFlips', 'Number of Flips', 60), 
        b = new Params('.graph.profit', 'totalProfit', 'Profit in U.S. Dollars', 100); 

  parent.graph = {

    main : function(data) {

      if (a.made && b.made) {
        app.graph.updateGraph(data, a);
        app.graph.updateGraph(data, b);
      } else {
        app.graph.makeGraph(data, a);
        app.graph.makeGraph(data, b);
      }

    },

    makeHistData : function(data) {
      // groups the data into bins for the d3 histogram

      // helper function to grab date object from date string
      var formatDate = d3.time.format("%Y-%m-%d");

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

      return histdata;
    },

    makeGraph : function(data, graph) {

      var histdata = app.graph.makeHistData(data);

      graph.x = d3.scale.linear()
          .domain([0, (xmax - xmin)])
          .range([0, width]);

      graph.x2 = d3.scale.linear()
          .domain([xmin, xmax])
          .range([0, width]);

      graph.y = d3.scale.linear()
          .domain([0, d3.max(histdata, function(d){
                  return d[graph.key];
                })])
          .range([height, 0]);

      graph.xAxis = d3.svg.axis()
          .scale(graph.x2)
          .tickFormat(function(d) {
            return d.toString();
          })
          .orient("bottom");

      graph.yAxis = d3.svg.axis()
          .scale(graph.y)
          .ticks(6)
          .orient("left");

      graph.svg = d3.select(graph.container).append("svg")
          .attr("position", "relative")
          .attr("width", width + graph.marginLeft + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + graph.marginLeft + "," + margin.top + ")");

      graph.bar = graph.svg.selectAll(".bar")
          .data(histdata)
          .enter()
          .append("g")
          .attr("class", "bar")
          .attr("transform", function(d,i) {
              return "translate(" + graph.x2(i * binsize + minbin) + "," + graph.y(d[graph.key]) + ")"; 
            });
      
      graph.bar.append("rect")
        .attr("x", graph.x(binmargin))
        .attr("width", graph.x(binsize - 2 * binmargin))
        .attr("height", function(d) { return height - graph.y( d[graph.key]); });

      // x-axis & labels
      graph.svg.append("g")
        .attr("class", "x axis " + graph.key)
        .attr("transform", "translate(0," + height + ")")
        .call(graph.xAxis);

      graph.svg.append("text")
        .attr("class", "xlabel")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom -5)
        .text("Year");

      // y-axis & labels
      graph.svg.append("g")
        .attr("class", "y axis " + graph.key)
        .attr("transform", "translate(0,0)")
        .call(graph.yAxis);

      graph.svg.append("text")
        .attr("class", "ylabel")
        .attr("y", 0 - graph.marginLeft)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text(graph.label);

      graph.made = true;

    },

    updateGraph : function(data, graph) {
      // update the data in the histogram
      
      // group the data into new bins
      var newhistdata = app.graph.makeHistData(data);

      // re calc the y scale and axis using the new data
      graph.y.domain([0, d3.max(newhistdata, function(d){
                            return d[graph.key];
                          })]);

      graph.yAxis = d3.svg.axis()
          .scale(graph.y)
          .ticks(6)
          .orient("left");

      // write new data to our bars, select rects and calc their height
      graph.bar.data(newhistdata)
        .transition()
        .duration(500)
        .attr("transform", function(d,i) {
            return "translate(" + graph.x2(i * binsize + minbin) + "," + graph.y(d[graph.key]) + ")"; 
          })
        .select("rect")
        .attr("x", graph.x(binmargin))
        .attr("width", graph.x(binsize - 2 * binmargin))
        .attr("height", function(d) { return height - graph.y(d[graph.key]); });

      d3.select('g.x.axis.' + graph.key).call(graph.xAxis);
      d3.select('g.y.axis.' + graph.key).call(graph.yAxis);
    },

  };

  return parent;

})(app || {}, d3);