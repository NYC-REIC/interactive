var app = (function(parent, w, d, $, d3) {
  // handles UI calculations

  var el = parent.el;

  parent.ui = {

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
          boroughs += app.ui.getBorough(el);
          if (i<arr.length -1){
            boroughs += ", ";
          }
        });

        $('.hoods.list').html(boroughs);
        $('.hoods').css("display","block");

      } else {
        app.ui.clearHoods();
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

        $('.hoods.list').html(hoodNames);
        $('.hoods').css("display","block");
      
      } else {
        app.ui.clearHoods();
      }

    },

    clearHoods : function() {
        $('.hoods.list').html("");
        $('.hoods').css("display","none");
    },

    circleElems : function() {
      // set the positioning of the profit & tax text to match the circle

      var circle = d3.select('.leafletCircle'),
          ctop = circle.node().getBoundingClientRect().top,
          cleft = circle.node().getBoundingClientRect().left,
          cwidth = Math.round(circle.node().getBoundingClientRect().width),
          cheight = Math.round(circle.node().getBoundingClientRect().height);

      el.cDiameter = Math.round((cwidth + cheight) / 2);

      var width = w.innerWidth,
          height = w.innerHeight,
          left = (width - cwidth)/2,
          top = ctop;

      var $profit = $('h1.profit'),
          pwidth = $profit.text().length * 20.8, //52.6,
          poffset = -((pwidth - cwidth) / 2) + "px"

      if (pwidth > cwidth) {
        // $profit.css('left', poffset);
      }

      // console.log('circle width/radius: ', cwidth);

      // change the spacing of the circle text based on the circle's size
      if (cwidth >= 700 ) {
        $('.total-flips').css("margin-top", "10%");
        $('.total-tax').css("margin-top", "8%");
        $('.hoods:first-of-type').css("margin-top", "4%");
      } else if (cwidth >=500 && cwidth < 700) {
        $('.total-flips').css("margin-top", "5%");
        $('.total-tax').css("margin-top", "1%");
        $('.hoods:first-of-type').css("margin-top", "4%");
      } else if (cwidth < 500 && cwidth > 425) {
        $('.total-flips').css("margin-top", "2%");
        $('.total-tax').css("margin-top", "2%");
        $('.hoods:first-of-type').css("margin-top", "1%");
      } else if (cwidth <= 425) {
        $('.total-flips').css("margin-top", "7%");
        $('.total-tax').css("margin-top", "2%");
        $('.hoods:first-of-type').css("margin-top", "1%");
      }

      $('.circle').css({
        "top" : top,
        "left" : left,
        "width" : cwidth,
        "height" : cheight,
        "display" : "block"
      });

      // change the size of the modal
      var $modal = $('#open-modal > div');
      $modal.width(el.cDiameter);
      $modal.height(el.cDiameter);
      $modal.css('top', top);

      if (cwidth <= 425) {
        $modal.css('top', 'initial');        
      }
    },

    curveText : function() {
      // position the "within this circle..." text by appending it to the L.circle svg

      // as the circle is rendered each time the map moves, remove previously drawn text
      if (d3.selectAll('#curve-text')[0].length) {
        d3.selectAll('#curve-text').remove();
      }

      var svg = d3.select('svg');
      
      // need to add an id property to the circle so that we can link our text to the circle svg
      svg.select('.leafletCircle').attr('id','curve');
      
      svg.append('text')
        .attr('id', 'curve-text')
        .attr('class', 'text-shadow')
        .append('textPath')
        .attr('xlink:href', '#curve')
        .text('Within this circle ...');

      var textPath = d3.select('#curve'),
          text = d3.select('#curve-text'),
          pathLength = textPath.node().getTotalLength(),
          textLength = text.node().getComputedTextLength(),
          width = d3.select('.leafletCircle').node().getBoundingClientRect().width,
          xoffset;

      if (width < 500 && width >= 290) {
        xoffset = ((pathLength / 4) * 3) + textLength;
      } else if (width < 290) {  
        xoffset = ((pathLength / 4) * 2.7) + textLength;
      } else {
        xoffset = ((pathLength / 4) * 3.1) + textLength;
      }

      console.log(width, xoffset)

      text.attr('x', xoffset);
      text.attr('dy', -10);
    }

    // calcUI : function() {
    //   // was using this to position the circle,
    //   var $header = $('header'),
    //         top = $header.offset().top,
    //         h = $header.height(),
    //         mtop = $header.css("margin-top").replace("px", ""),
    //         mbottom = $header.css("margin-bottom").replace("px","");
    //   mtop = +mtop;
    //   mbottom = +mbottom;

    //   // how much room to offset the circle from the header
    //   el.marginTop = top + h + mtop + mbottom;
    // }

  }; // end parent.ui object

  return parent;

})(app || {}, window, document, jQuery, d3);