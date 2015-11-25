var app = (function(parent){ 
  //cartocss for styling the data layer from CartoDB 

  parent.el.cartocss = {"circle-query":"#nyc_flips_pluto_150712{polygon-fill:#A53ED5;polygon-opacity:0.6;line-color:#FFF;line-width:0;line-opacity:0;[within=true]{polygon-fill:#CE0059;}}","city-council-district":"/**choroplethvisualization*/#nycc_joined_to_nyc_flips_2263{polygon-fill:#FFFFB2;polygon-opacity:0.8;line-color:#FFF;line-width:0.5;line-opacity:1;}#nycc_joined_to_nyc_flips_2263[flip_tax<=9537580]{polygon-fill:#B10026;}#nycc_joined_to_nyc_flips_2263[flip_tax<=3546568.7]{polygon-fill:#E31A1C;}#nycc_joined_to_nyc_flips_2263[flip_tax<=1508691.64]{polygon-fill:#FC4E2A;}#nycc_joined_to_nyc_flips_2263[flip_tax<=1116919.47]{polygon-fill:#FD8D3C;}#nycc_joined_to_nyc_flips_2263[flip_tax<=877215.2]{polygon-fill:#FEB24C;}#nycc_joined_to_nyc_flips_2263[flip_tax<=639937.94]{polygon-fill:#FED976;}#nycc_joined_to_nyc_flips_2263[flip_tax<=388611.86]{polygon-fill:#FFFFB2;}","taxLots":"#nyc_flips_pluto_150712{polygon-fill:#A53ED5;polygon-opacity:0.6;line-color:#FFF;line-width:0;line-opacity:0;}"};

  return parent;

})(app || {});