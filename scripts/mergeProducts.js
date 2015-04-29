var products = require("../products.json");
var parse = require("csv-parse");
var fs = require("fs");
var transform = require("stream-transform");
var _ = require("underscore");
var output = [];
var keskoReaktor = fs.createReadStream("./keskoReaktor.csv");
var parser = parse();

var merger = transform(function(record, callback) {
  var prod = _.find(products, function(elem) {
    return elem.ean === record[0];
  });
  if(prod) {
    prod.price = record[4] // price
    prod.unitPrice = record[5]; // unit price
    callback(null, JSON.stringify(prod) + ",\n")
  }
});

keskoReaktor.pipe(parser).pipe(merger).pipe(process.stdout);
