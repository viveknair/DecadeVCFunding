var n = 0, // number of layers
    m = 20; // number of samples per layer

var data = null,
    color = d3.scale.category20();
var categories = new Object();
var max, min = 0;
var width = 800,
    height = 400;

var vis = d3.select("#chart")
  .append("svg")
    .attr("width", width)
    .attr("height", height + 50);

d3.json("data/json/crunchbase_data.json", function(json) {
  var new_data = new Array();
  max = d3.max(json, function(d){ return d._id.funded_year});
  min = d3.min(json, function(d){ return d._id.funded_year});
  //Set year range as m
  m = max - min + 1;
  for(var i = 0; i < json.length; i++){
    if(json[i]._id.category_code){
      categories[json[i]._id.category_code] = true;
    }
  };
  categories = d3.keys(categories);
  n = categories.length;
  for(var i = 0; i < n; i++){
    new_data[i] = new Array(m);
    for(var j = 0; j < new_data[i].length; j++){
      new_data[i][j] = {x:j, y:0}
    }
  }
  // n = categories
  // m = year range starting at min
  for(var i = 0; i < json.length; i++){
    if(new_data[categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].y === undefined){
      new_data[categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].y = json[i].value.total_amount;
    }
    else new_data[categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].y += json[i].value.total_amount;
    new_data[categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].category = json[i]._id.category_code;
  }
  data = d3.layout.stack()(new_data);
  for(var i = 0; i < data.length; i++){
    data[i].category = categories[i];
  }

var mx = m - 1,
    my = d3.max(data, function(d) {
      return d3.max(d, function(d) {
        return d.y0 + d.y;
      });
    });

var area = d3.svg.area()
    .x(function(d) { return d.x * width / mx; })
    .y0(function(d) { return height - d.y0 * height / my; })
    .y1(function(d) { return height - (d.y + d.y0) * height / my; })
    .interpolate(['linear']);

vis.selectAll("path")
    .data(data)
  .enter().append("path")
    .style("fill", function() { return color(Math.random()); })
    .on("mouseover", function(d){ d3.select("#desc").text(d.category.capitalize()); return d3.select(this).style("opacity", .5)})
    .on("mouseout", function(d){ d3.select("#desc").text("Hover over an entry"); return d3.select(this).style("opacity", 1)})
    .transition()
      .duration(500)
      .attr("d", area);

var x = function(d) { return d.x * width / m; }
var labels = vis.selectAll("text.label")
    .data(data[0])
  .enter().append("text")
    .attr("class", "label")
    .attr("x", x)
    .attr("y", height + 6)
    .attr("dx", x({x: .45}))
    .attr("dy", ".71em")
    .attr("text-anchor", "middle")
    .text(function(d, i) { return i + min; });

});





String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function generateData(n,m){
  var test_data = [];
  for(var i = 0; i < n; i++){
    var arr = new Array();
    for(var j = 0; j < m * 2; j++){
      var current = .2 + Math.random();
      arr.push({x:j, y:current});
      j += 1
      arr.push({x:j+.4, y:current});
    }
    test_data.push(arr);
  } 
  return test_data;
}

