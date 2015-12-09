var app = (function(parent, w, d, $, d3) {
  // handles UI calculations

  parent.circleElems = function() {
    // set the positioning of the profit & tax text to match the circle

    var circle = d3.select('.leafletCircle'),
        ctop = circle.node().getBoundingClientRect().top,
        cleft = circle.node().getBoundingClientRect().left,
        cwidth = circle.node().getBoundingClientRect().width,
        cheight = circle.node().getBoundingClientRect().height;

    var width = w.innerWidth,
        height = w.innerHeight,
        left = (width - cwidth)/2,
        top = ctop;

    $('.circle').css({
      "top" : top,
      "left" : left,
      "width" : cwidth,
      "height" : cheight,
      "display" : "block"
    });

    var $profit = $('h1.profit'),
        pwidth = $profit.text().length * 52.6,
        poffset = -((pwidth - cwidth) / 2) + "px"

    if (pwidth > cwidth) {
      $profit.css('left', poffset);
    }

    // console.log('circle width/radius: ', cwidth);

    // change the spacing of the circle text based on the circle's size
    if (cwidth >= 700 ) {
      $('.total-flips').css("margin-top", "10%");
      $('.total-tax').css("margin-top", "8%");
      $('.hoods:first-of-type').css("margin-top", "4%");
    } else if (cwidth >=500 && cwidth < 700) {
      $('.total-flips').css("margin-top", "5%");
      $('.total-tax').css("margin-top", "5%");
      $('.hoods:first-of-type').css("margin-top", "4%");
    } else if (cwidth < 500) {
      $('.total-flips').css("margin-top", "2%");
      $('.total-tax').css("margin-top", "2%");
      $('.hoods:first-of-type').css("margin-top", "1%");
    }

  }

  parent.curveText = function() {
    // position the "within this circle..." text by appending it to L.circle svg

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
        xoffset;

    if ( d3.select('.leafletCircle').node().getBoundingClientRect().width < 500) {
      xoffset = ((pathLength / 4) * 3) + textLength;
    } else {
      xoffset = ((pathLength / 4) * 3.1) + textLength;
    }

    text.attr('x', xoffset);
    text.attr('dy', -10);
  }

  parent.calcUI = function() {
    var el = parent.el;
    var $header = $('header'),
          top = $header.offset().top,
          h = $header.height(),
          mtop = $header.css("margin-top").replace("px", ""),
          mbottom = $header.css("margin-bottom").replace("px","");
    mtop = +mtop;
    mbottom = +mbottom;

    // how much room to offset the circle from the header
    el.marginTop = top + h + mtop + mbottom;
  }

  return parent;

})(app || {}, window, document, jQuery, d3);