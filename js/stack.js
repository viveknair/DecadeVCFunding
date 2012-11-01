var n = 0, // number of layers
    m = 20; // number of samples per layer


m *= 2;

var data = null,
    color = d3.scale.category20();
var categories = new Object();
var max, min = 0;

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
  }
  data = d3.layout.stack()(new_data);
var width = 800,
    height = 500,
    mx = m - 1,
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

var vis = d3.select("#chart")
  .append("svg")
    .attr("width", width)
    .attr("height", height);

vis.selectAll("path")
    .data(data)
  .enter().append("path")
    .style("fill", function() { return color(Math.random()); })
    .transition()
      .duration(500)
      .attr("d", area);
});



// var margin = 20,
//     width = 600,
//     height = 500 - .5 - margin,
//     mx = m,
//     my = d3.max(data, function(d) {
//       return d3.max(d, function(d) {
//         return d.y0 + d.y;
//       });
//     }),
//     mz = d3.max(data, function(d) {
//       return d3.max(d, function(d) {
//         return d.y;
//       });
//     }),
//     x = function(d) { return d.x * width / mx; },
//     y0 = function(d) { return height - d.y0 * height / my; },
//     y1 = function(d) { return height - (d.y + d.y0) * height / my; },
//     y2 = function(d) { return d.y * height / mz; }; // or `my` to not rescale

// var x_scale = d3.scale.linear().domain([0, mx]).range([0, width]);
// var y_scale = d3.scale.linear().domain([0, my]).range([0,height]);

// var x_axis = d3.svg.axis().scale(x_scale).orient("bottom").ticks(64);
// var y_axis = d3.svg.axis().scale(y_scale).orient("left").ticks(10);

// var vis = d3.select("#chart")
//   .append("svg")
//     .attr("width", width)
//     .attr("height", height + margin);

// vis.append("g")
//   .call(x_axis)
//   .attr("transform", "translate(" + [0, 0] + ")scale(1,-1)");
// vis.append("g")
//   .attr("transform", "translate(" + [0, height] + ")scale(1,-1)")
//   .call(y_axis);

// var layers = vis.selectAll("g.layer")
//     .data(data)
//   .enter().append("g")
//     .style("fill", function(d, i) { return color(i / (n - 1)); })
//     .attr("class", "layer");

// var bars = layers.selectAll("g.bar")
//     .data(function(d) { return d; })
//   .enter().append("g")
//     .attr("class", function(d,i){ return "bar num" + i})
//     .attr("data-time", function(d,i){ return i})
//     .attr("transform", function(d) { return "translate(" + x(d) + ",0)"; })
//     .on("mouseover", function(d,i){ vis.selectAll('.num' + i).style('opacity', .5) })
//     .on("mouseout", function(d,i){ vis.selectAll('.num' + i).style('opacity', 1) });

// bars.append("rect")
//     .attr("width", x({x: .9}))
//     .attr("x", 0)
//     .attr("y", height)
//     .attr("height", 0)
//   .transition()
//     .delay(function(d, i) { return i * 10; })
//     .attr("y", y1)
//     .attr("height", function(d) { return y0(d) - y1(d); });

// var labels = vis.selectAll("text.label")
//     .data(data[0])
//   .enter().append("text")
//     .attr("class", "label")
//     .attr("x", x)
//     .attr("y", height + 6)
//     .attr("dx", x({x: .45}))
//     .attr("dy", ".71em")
//     .attr("text-anchor", "middle")
//     .text(function(d, i) { return i; });

// vis.append("line")
//     .attr("x1", 0)
//     .attr("x2", width - x({x: .1}))
//     .attr("y1", height)
//     .attr("y2", height);

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

