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

      var graphRect = d3.select('.graph.ui').node().getClientRects();
          graphHeight = graphRect[0].height,
          graphWidth = graphRect[0].width;

      var binmargin = 0.2,
          margin = {top: 10, right: 30, bottom: 30, left: 50},
          width = graphWidth - margin.left - margin.right,
          height = graphHeight - margin.top - margin.bottom;

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

      var x = d3.scale.linear()
          .domain([0, (xmax - xmin)])
          .range([0, width]);

      var x2 = d3.scale.linear()
          .domain([xmin, xmax])
          .range([0, width]);

      var y = d3.scale.linear()
          .domain([0, d3.max(histdata, function(d){
                  return d.numFlips;
                })])
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x2)
          .tickFormat(function(d) {
            return d.toString();
          })
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .ticks(8)
          .orient("left")

      var svg = d3.select(".graph.ui").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var bar = svg.selectAll(".bar")
          .data(histdata)
          .enter()
          .append("g")
          .attr("class", "bar")
          .attr("transform", function(d,i) {
              return "translate(" + x2(i * binsize + minbin) + "," + y(d.numFlips) + ")"; 
            });
      
      bar.append("rect")
        .attr("x", x(binmargin))
        .attr("width", x(binsize - 2 * binmargin))
        .attr("height", function(d) { return height - y(d.numFlips); });

      // x-axis & labels
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      // no need to add the label "year"
      // svg.append("text")
      //   .attr("class", "xlabel")
      //   .attr("text-anchor", "middle")
      //   .attr("x", width / 2)
      //   .attr("y", height + margin.bottom)
      //   .text("");

      // y-axis & labels
      svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,0)")
        .call(yAxis);

      svg.append("text")
        .attr("class", "ylabel")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Number of Flips");
    }

  };

  return parent;

})(app || {}, d3);