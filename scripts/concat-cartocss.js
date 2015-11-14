// This script converts .mss cartocss files into strings to be consumed by cartodb.js
// run it from inside the scripts/ directory
var fs = require('fs'),
    dir = '../mss/',
    outFile = '../js/app.cartocss.js',
    mssFiles = [],
    cartoStrings = {};

/*
    Process:
    1. Read files from mss/
    2. convert each file contents to concatenated string
    3. assign each cartocss string to a key in an {}
    4. write object to a .js outfile
*/

function readdir() {
  fs.readdir(dir, function(err,files){
    if (err) return console.error(err);
    mssFiles = files;
    console.log(mssFiles);
    iterateFiles();
  });
}

function iterateFiles() {
  mssFiles.forEach(function(file,i,arr){
    
    fs.readFile(dir + file, 'utf8', function(err, contents) {
      if (err) return console.error(err);

      convertString(file, contents);

      // console.log('iterateFiles index: ', i, '\n\n');

      if (i === mssFiles.length -1 ){
        writeJSON();
      }      

    });
  });
}

function convertString(file, data) {
  var key = file.replace('.mss','');
  var x = data.split('\n').join('').replace(/ /g,'').replace(/\t/g, '');

  // console.log('key: ', key, ' data: ', x, '\n\n');

  cartoStrings[key] = x;
}

function writeJSON() {
  var data = JSON.stringify(cartoStrings);  
  var js = "var app = (function(parent){ \n" +  
            "  //cartocss for styling the data layer from CartoDB \n\n" + 
            "  parent.el.cartocss = " + data + ";\n\n  return parent;\n\n})(app || {});";

  fs.writeFile(outFile, js,  function(err){
    if (err) throw err;
    console.log('success!');
  });  
}

readdir();