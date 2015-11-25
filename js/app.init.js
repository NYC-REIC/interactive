var app = (function(parent){
  // start up the app!
  
  parent.init = function() {
    app.calcUI();
    app.splitHash();
    app.map.init();
    app.eventListeners();
    app.circle.getCurCenterTop();
    app.circle.queryCDB();
    app.circle.makeBuffer();
    app.circleElems();
  }

  return parent;
  
})(app || {});