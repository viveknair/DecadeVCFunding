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
  console.log( "The minimum is " + min );
  //Set year range as m and one more to hold the metadata
  m = max - min + 1;
  for(var i = 0; i < json.length; i++){
    if(json[i]._id.category_code){
      categories[json[i]._id.category_code] = { total_amount: 0 };
    }
  };
  key_categories = d3.keys(categories);
  n = key_categories.length;
  for(var i = 0; i < n; i++){
    new_data[i] = new Array(m);
    for(var j = 0; j < new_data[i].length; j++){
      // Category code for a certain year
      new_data[i][j] = {x:j, y:0, category_code : null, funding_rounds : 0 }
    }
  }

  // n = categories
  // m = year range starting at min
  for(var i = 0; i < json.length; i++) {
    if (key_categories.indexOf(json[i]._id.category_code)) {
      categories[json[i]._id.category_code].total_amount += json[i]._id.funded_year
    }
    if(new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].y === undefined) {
      // Individual cell data updating
      new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].y = json[i].value.total_amount;
      new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].category_code = json[i]._id.category_code; 
      new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].funding_rounds = json[i].value.number_funding_rounds; 
    } else {
      // Individual cell data updating
      new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].y += json[i].value.total_amount;
      new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].category_code = json[i]._id.category_code;
      new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - min].funding_rounds = json[i].value.number_funding_rounds; 
    }
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
    .interpolate(['basis']);

var vis_wrapper = d3.select("#chart")
  .append("svg")
  .attr('width', 1200)
  .attr('height', 1200);

var vis_sidebar = vis_wrapper.append('svg:g')
  .attr('class', 'sidebar_visualization')
  .attr('width', 300)
  .attr('height', 600)
  .attr('transform', 'translate(870, 30)')

vis_sidebar.selectAll('circle.industry_circle')
  .data(key_categories)
 .enter().append('circle')
  .attr('class', function(d,i) {
    return 'industry-' + d;
  }) .attr('r', 20)
  .attr('transform', function(d,i) {
    var x = (i >= 8) ? 200 : 0; 
    return 'translate(' + x + ',' + (50 * (i % 8))  +')'; 
  })
  .style('fill', function(d,i) {
    return color(i);
  })
  .on('mouseover', function() {
    d3.select(this)
      .transition()
      .duration(500)
      .style('fill', 'turquoise')
  })
  .on('mouseout', function(d,i) {
    d3.select(this)
      .transition()
      .duration(500)
      .style('fill', function() {
        return color(i);
      }) 
  })


vis_sidebar.selectAll('text.industry_text')
  .data(key_categories)
 .enter().append('svg:text')
  .attr('class', function(d,i) {
     return 'industry-' + d;
  })
  .text(function(d,i) {
    return String(d);
  })
  .attr('transform', function(d,i) {
    var x = (i >= 8) ? 200 : 0; 
    return 'translate(' + (x + 40) + ',' + (50 * (i % 8))  +')'; 
  })
  .style('fill', '#555')

var vis = vis_wrapper.append('svg:g')
  .attr('class', 'main_visualization')
  .attr("width", width)
  .attr("height", height);

vis.selectAll("path.industries")
    .data(data)
  .enter().append("path")
    .attr('class', function(d,i) {
      return 'industry-' + d[m-1].category_code;
    })
    .style("fill", function(d, i) { 
      return color(i); 
    })
    .on('mouseover', function(d,i) {
      var consideration_element = d;

      d3.selectAll('circle')
        .each(function() {
          var circle = d3.select(this);
          if (circle.attr('class') == 'industry-' + d[m-1].category_code) {
            circle
              .transition()
              .duration(200)
              .style('opacity', 1.0);
          } else {
            circle
              .transition()
              .duration(200)
              .style('opacity', 0.2);
          } 
        })

      d3.selectAll('text')
        .each(function() {
          var circle = d3.select(this);
          if (circle.attr('class') == 'industry-' + d[m-1].category_code) {
            circle
              .transition()
              .duration(200)
              .style('opacity', 1.0);
          } else {
            circle
              .transition()
              .duration(200)
              .style('opacity', 0.2);
          } 
        })
    })
    .on('mouseout', function(d,i) {
      var consideration_element = d;

      d3.selectAll('circle')
        .each(function() {
          var circle = d3.select(this);
          circle
            .transition()
            .duration(200)
            .style('opacity', 1.0);
        })

      d3.selectAll('text')
        .each(function() {
          var text = d3.select(this);
          text
            .transition()
            .duration(200)
            .style('opacity', 1.0);
        })

      
    })

    .transition()
      .duration(500)
      .attr("d", area)
});

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

