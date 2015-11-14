var app = (function(parent){
  // start up the app!
  
  parent.init = function() {
    app.splitHash();
    app.map.init();
    app.eventListeners();
  }

  return parent;
  
})(app || {});