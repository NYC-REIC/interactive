var app = (function(parent, w, d, $, L, cartodb) {

  // "el" is just an object we store our "miscelaneous" variables in so we can pass them between modules
  parent.el = {
    baselayer : new L.StamenTileLayer("toner-lite"),
    sql : new cartodb.SQL({ user: 'chenrick' }),
    taxLots : "nyc_flips_pluto_150712",
    all_the_things : [],
    $map : $('#map'),
    url : w.location.href,
    hashurl : null,
    map : null,
    buildings: null,
    geom_center: null,
    prev_bldg: null,
    layerSource : null,
    cdbOptions : null,
    dataLayer : null,
    queriedData: null,
    sum: null,
    tax: null,
    cartocss : null,
    fgTest : null,
    bounds : null,
    center : null,
    topPoint : null,
    centerPoint : null
  };

  return parent;

})(app || {}, window, document, jQuery, L, cartodb);