var app = (function(parent, w, d, $, d3) {
  // handles UI calculations

  parent.circleElems = function() {
    // set the circular lettering & position of the profit & tax text

    var diameter = 435,
        topOffSet = 20,
        left = (window.innerWidth / 2) - (diameter / 2) + "px",
        top = (window.innerHeight / 2) - (diameter / 2) - topOffSet + "px";

    $('.circle').css({
      "top" : top,
      "left" : left,
      "display" : "block"
    });
    
  }

  parent.curveText = function() {
    // position the "within this circle..." text by appending it to L.circle

    // as the circle is rendered each time the map moves, remove previously drawn text
    if (d3.selectAll('#curve-text')[0].length) {
      d3.selectAll('#curve-text').remove();
    }

    var svg = d3.select('svg');
    
    svg.select('.leafletCircle').attr('id','curve');
    
    svg.append('text')
      .attr('id', 'curve-text')
      .append('textPath')
      .attr('xlink:href', '#curve')
      .text('Within this circle ...');

    var textPath = d3.select('#curve'),
        text = d3.select('#curve-text'),
        pathLength = textPath.node().getTotalLength(),
        textLength = text.node().getComputedTextLength(),
        xoffset = ((pathLength / 4) * 3) + textLength;

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