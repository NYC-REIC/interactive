var app = (function(parent){
  // start up the app!
  
  parent.init = function() {
    app.splitHash();
    app.map.init();
    app.circle.getCurCenterTop();
    app.circle.queryCDB();
    app.circle.makeBuffer();
    app.eventListeners();
    app.curveText();
    app.circleElems();
  }

  return parent;
  
})(app || {});