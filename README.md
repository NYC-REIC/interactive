# LANDSCAPES OF PROFIT :: Interactive
An interactive map / data-viz of all properties that were bought and sold within a two year period in New York City from 2003-01-01 to 2015-05-19. This data was derived from an analysis of NYC's property transaction database, [ACRIS](http://a836-acris.nyc.gov/CP/) using [Docker For Data](https://github.com/talos/docker4data). The interactive calculates the total profit and a proposed "1% flip tax" for a given geographic area in NYC__*__. You can learn more about the [methodology and rationale here](http://www.landscapesofprofit.com/) and [view the working prototype here](http://www.landscapesofprofit.com/interactive/).

__*__ Staten Island's property transactions are not included in ACRIS.

## Download the Data
The data is currently hosted on CartoDB and can be [downloaded here](https://chenrick.cartodb.com/tables/nyc_flips_pluto_150712/public)

## Dependencies
- CartoDB, CartoDB.JS, SQL API
- Leaflet.JS
- Leaflet Geocoder Plug-in
- Turf.JS
- Lodash 

## Updating the CartoCSS
1. Edit the corresponding files in the `mss/` directory
2. Make sure you have Node.JS installed and then  
    `cd scripts/ && node concat-cartocss.js`  
    (uses all core Node modules, no dependencies required)

This will update the `app.cartocss` module in `js/app.cartocss.js`.
