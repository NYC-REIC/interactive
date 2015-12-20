var app = (function(parent){
  // start up the app!
  
  parent.init = function() {
    app.splitHash();
    app.map.init();
    app.circle.measureBBox();
    app.circle.makeBuffer();
    app.eventListeners();
    app.ui.curveText();
    app.ui.circleElems();
  }

  return parent;
  
})(app || {});