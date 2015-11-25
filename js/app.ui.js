var app = (function(parent, w, d, $) {
  // handles UI calculations

  parent.circleElems = function() {
    // set the circular lettering & position of the profit & tax text
    // code credit: https://css-tricks.com/set-text-on-a-circle/

    var diameter = 435,
        topOffSet = 20,
        left = (window.innerWidth / 2) - (diameter / 2) + "px",
        top = (window.innerHeight / 2) - (diameter / 2) - topOffSet + "px";
    
    // break up the "within this circle..." characters
    var $within = $('.within').lettering();
    var $letters = $within.children();

    $('.circle').css({
      "top" : top,
      "left" : left,
      "display" : "block"
    });

    $.each($letters, function(i, el){
      $(el).css({
        '-webkit-transform' : 'rotate(' + (i * 3) + 'deg' + ')',
        '-moz-transform'    : 'rotate(' + (i * 3) + 'deg' + ')',
        '-ms-transform'     : 'rotate(' + (i * 3) + 'deg' + ')',
        '-o-transform'      : 'rotate(' + (i * 3) + 'deg' + ')',
        'transform'         : 'rotate(' + (i * 3) + 'deg' + ')'
      });
    });

    $('.within').css("display", "block");
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

})(app || {}, window, document, jQuery);