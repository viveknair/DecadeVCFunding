var n = 0, // number of layers
    m = 20; // number of samples per layer

var data = null,
    color = d3.scale.category20c();
var categories = new Object();
var max, min = 0;
var width = 800,
    height = 400,
    containerWidth = 1400,
    containerHeight = 500,
    minYear = 2002,
    vizMarginLeft = 120,
    vizMarginTop = 20,
    sidebarMarginLeft = 975,
    sidebarMarginTop = 40;

var categoryMapping = {
  'advertising' : 'Advertising',
  'biotech': 'BioTech',
  'cleantech': 'CleanTech',
  'consulting': 'Consulting',
  'ecommerce': 'eCommerce',
  'education': 'Education',
  'enterprise': 'Enterprise',
  'games_video': 'Games, Video and Entertainment',
  'hardware': 'Hardware',
  'mobile': 'Mobile/Wireless',
  'network_hosting': 'Network/Hosting',
  'other': 'Other',
  'public_relations': 'Communications',
  'search': 'Search',
  'security': 'Security',
  'semiconductor': 'Semiconductor',
  'software': 'Software',
  'web': 'Consumer Web'
}

var omittedCategories = ['legal', 'consulting']


d3.json("data/json/crunchbase_data.json", function(json) {
  var new_data = new Array();
  max = d3.max(json, function(d){ return d._id.funded_year});
  min = d3.min(json, function(d){ return d._id.funded_year});
  //Set year range as m
  m = max - minYear + 1;
  for(var i = 0; i < json.length; i++){
    if(json[i]._id.category_code &&  omittedCategories.indexOf(json[i]._id.category_code) === -1){
      categories[json[i]._id.category_code] = { category_code: json[i]._id.category_code, total_amount: 0 };
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
  for(var i = 0; i < json.length; i++){
    if(json[i]._id.funded_year >= minYear && (key_categories.indexOf(json[i]._id.category_code) !== -1)){
      categories[json[i]._id.category_code].total_amount += json[i].value.total_amount;
      new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - minYear].y += json[i].value.total_amount;
      new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - minYear].category = json[i]._id.category_code;
      new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - minYear].category_code = json[i]._id.category_code;
      new_data[key_categories.indexOf(json[i]._id.category_code)][json[i]._id.funded_year - minYear].funding_rounds = json[i].value.number_funding_rounds; 
    }
  }
  data = d3.layout.stack()(new_data);
  for(var i = 0; i < data.length; i++){
    data[i].category = categories[i];
  }

  new_categories = []
  
  for (var key in categories) {
    if (categories.hasOwnProperty(key)) {
      new_categories.push(categories[key]) 
    }
  }

var mx = m - 1,
    my = d3.max(data, function(d) {
      return d3.max(d, function(d) {
        return d.y0 + d.y;
      });
    });

var y_scale = d3.scale.linear().domain([0, my]).range([height,0]).nice();      
var y_axis = d3.svg.axis().scale(y_scale).orient("left").ticks(10);

var area = d3.svg.area()
    .x(function(d) { return d.x * width / mx; })
    .y0(function(d) { return height - d.y0 * height / my; })
    .y1(function(d) { return height - (d.y + d.y0) * height / my; })
    .interpolate(['basis']);

var vis_wrapper = d3.select("#chart")
  .append("svg")
  .attr('width', containerWidth)
  .attr('height', containerHeight)
  .append("svg:g")
  .attr('class', 'complete_visualization')
  .attr('tranform', 'translate(' + [vizMarginLeft, vizMarginTop] + ')');

var vis_sidebar = vis_wrapper.append('svg:g')
  .attr('class', 'sidebar_visualization')
  .attr('width', 300)
  .attr('height', 600)
  .attr('transform', 'translate('+ [sidebarMarginLeft, sidebarMarginTop] + ')')

console.log(categories);
var legend_groups = vis_sidebar.selectAll('g.industry_group')
  .data(new_categories)
 .enter().append('svg:g')
  .attr('class', function(d,i) {
    return 'industry-' + d.category_code ;
  })  

legend_groups 
    .attr('transform', function(d,i) {
      console.log("translateing with this index: " + i );
      var x = 0;
      return 'translate(' + x + ',' + (23.5 * i)  +')'; 
    })
   .on('mouseover', function(d, i) {
    d3.selectAll('path')
      .each(function() {
        var circle = d3.select(this);
        if (circle.attr('class') == 'industry-' + d.category_code) {
          circle
            .transition()
            .duration(200)
            .style('opacity', 1.0);
        } else {
          circle
            .transition()
            .duration(200)
            .style('opacity', 0.1);
        } 
      })

    d3.selectAll('circle')
      .each(function() {
        var circle = d3.select(this);
        if (circle.attr('class') == 'industry-' + d.category_code) {
          circle
            .transition()
            .duration(200)
            .style('opacity', 1.0);
        } else {
          circle
            .transition()
            .duration(200)
            .style('opacity', 0.1);
        } 
      })

    d3.selectAll('text.text-element-industry')
      .each(function() {
        var circle = d3.select(this);
        if (circle.attr('class') == 'industry-' + d.category_code + ' text-element-industry') {
          circle
            .transition()
            .duration(200)
            .style('opacity', 1.0);
        } else {
          circle
            .transition()
            .duration(200)
            .style('opacity', 0.1);
        } 
      })

  })
  .on('mouseout', function(d,i) {

    d3.selectAll('path')
      .each(function() {
        var circle = d3.select(this);
        circle
          .transition()
          .duration(200)
          .style('opacity', 1.0);
      })

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
        var circle = d3.select(this);
        circle
          .transition()
          .duration(200)
          .style('opacity', 1.0);
      })

  })

var circle_legend = legend_groups
  .append('circle')
  .attr('class', function(d,i) {
    return 'industry-' + d.category_code;
  })
  .attr('r', 7)
  .style('fill', function(d,i) {
    return color(d.category_code);
  })

var text_legend = legend_groups
  .append('svg:text')
  .attr('class', function(d,i) {
     return 'industry-' + d.category_code + ' text-element-industry';
  })
  .text(function(d,i) {
    return String(categoryMapping[d.category_code]);
  })
  .attr('transform', 'translate(' + [15, 4] +')')
  .style('fill', '#555')

var vis = vis_wrapper.append('svg:g')
  .attr('class', 'main_visualization')
  .attr("width", width)
  .attr("height", height)
  .attr("transform", 'translate(' + [vizMarginLeft , vizMarginTop] + ')'); 

vis.selectAll("line")
    .data(y_scale.ticks(10))
    .enter().append("line")
    .attr("class", "cols")
    .attr("x1", 5)
    .attr("x2", width) 
    .attr("y1", y_scale)
    .attr("y2", y_scale)
    .style("stroke", "#dddddd");

vis.selectAll("path.industries")
    .data(data)
  .enter().append("path")
    .attr('class', function(d,i) {
      return 'industry-' + d[m-1].category_code;
    })
    .style("fill", function(d, i) { 
      return color(d[m-1].category_code); 
    })

    .transition()
      .duration(500)
      .attr("d", area)


    vis.append("g")
      .attr("transform", "translate(" + [10, 0] + ")")
      .call(y_axis);
    
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
      .text(function(d, i) { return i + minYear; });

});
