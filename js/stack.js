

var n = 6, // number of layers
    m = 20; // number of samples per layer


m *= 2;

var data = d3.layout.stack()(generateData(n,m)),
    data1 = d3.layout.stack()(generateData(n,m)),
    color = d3.scale.category20();

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

function transitionGroup() {
  var group = d3.selectAll("#chart");

  group.select("#group")
      .attr("class", "first active");

  group.select("#stack")
      .attr("class", "last");

  group.selectAll("g.layer rect")
    .transition()
      .duration(500)
      .delay(function(d, i) { return (i % m) * 10; })
      .attr("x", function(d, i) { return x({x: .9 * ~~(i / m) / n}); })
      .attr("width", x({x: .9 / n}))
      .each("end", transitionEnd);

  function transitionEnd() {
    d3.select(this)
      .transition()
        .duration(500)
        .attr("y", function(d) { return height - y2(d); })
        .attr("height", y2);
  }
}

function transitionStack() {
  var stack = d3.select("#chart");

  stack.select("#group")
      .attr("class", "first");

  stack.select("#stack")
      .attr("class", "last active");

  stack.selectAll("g.layer rect")
    .transition()
      .duration(500)
      .delay(function(d, i) { return (i % m) * 10; })
      .attr("y", y1)
      .attr("height", function(d) { return y0(d) - y1(d); })
      .each("end", transitionEnd);

  function transitionEnd() {
    d3.select(this)
      .transition()
        .duration(500)
        .attr("x", 0)
        .attr("width", x({x: .9}));
  }
}

/* Inspired by Lee Byron's test data generator. */
function stream_layers(n, m, o) {
  if (arguments.length < 3) o = 0;
  function bump(a) {
    var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
    for (var i = 0; i < m; i++) {
      var w = (i / m - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }
  return d3.range(n).map(function() {
      var a = [], i;
      for (i = 0; i < m; i++) a[i] = o + o * Math.random();
      for (i = 0; i < 5; i++) bump(a);
      return a.map(stream_index);
    });
}

/* Another layer generator using gamma distributions. */
function stream_waves(n, m) {
  return d3.range(n).map(function(i) {
    return d3.range(m).map(function(j) {
        var x = 20 * j / m - i / 3;
        return 2 * x * Math.exp(-.5 * x);
      }).map(stream_index);
    });
}

function stream_index(d, i) {
  return {x: i, y: Math.max(0, d)};
}