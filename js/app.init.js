var app = (function(parent){
  // start up the app!
  
  parent.init = function() {
    app.splitHash();
    app.map.init();
    app.circleElems();
    app.eventListeners();
    app.circle.getCurCenterTop();
    app.circle.makeBuffer();
  }

  return parent;
  
})(app || {});