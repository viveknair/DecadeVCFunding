var n = 0, // number of layers
    m = 20; // number of samples per layer

var data = null,
    color = d3.scale.category20c();
   
var categories = new Object();
var max, min = 0;
var width = 600,
    height = 400,
    containerWidth = 1400,
    containerHeight = 500,
    minYear = 2002,
    vizMarginLeft = 180,
    vizMarginTop = 20,
    sidebarMarginLeft = width + 225,
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

  color_options = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#17becf', '#9edae5']
  color_options = color_options.reverse() 

  var custom_color = d3.scale.ordinal()
    .domain(key_categories)
    .range(color_options)  

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
legend_groups = vis_sidebar.selectAll('g.industry_group')
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
            .style('opacity', 1.0)
            .style('stroke-width', 1)
            .style('stroke', 'grey')
        } else {
          circle
            .transition()
            .duration(200)
            .style('opacity', 0.1)
            .style('stroke', 'none')
        } 
      })

    d3.selectAll('circle')
      .each(function() {
        var circle = d3.select(this);
        if (circle.attr('class') == 'industry-' + d.category_code) {
          circle
            .transition()
            .duration(200)
            .style('opacity', .9);
        } else {
          circle
            .transition()
            .duration(200)
            .style('opacity', 0.2);
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
            .style('opacity', 0.2);
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
          .style('opacity', 1.0)
          .style('stroke', 'none')
      })

    d3.selectAll('circle')
      .each(function() {
        var circle = d3.select(this);
        circle
          .transition()
          .duration(200)
          .style('opacity', .9);
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
    return custom_color(d.category_code);
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

var grid_lines = vis.append('svg:g')
  .attr('class', 'grid_lines_group')

grid_lines
  .selectAll("line")
    .data(y_scale.ticks(10))
    .enter().append("line")
    .attr("class", "cols")
    .attr("x1", 0)
    .attr("x2", width) 
    .attr("y1", y_scale)
    .attr("y2", y_scale)
    .style("stroke", "#dddddd");

var y_axis_label = vis.append('svg:g')
  .attr('class', 'y_label')

y_axis_label
  .append('svg:text')
  .text('Funding Amount in Dollars')
  .attr('transform', 'rotate(270) translate(' + [-240, -130] + ')');

var x_axis_label = vis.append('svg:g')
  .attr('class', 'x_label')

x_axis_label
  .append('svg:text')
  .text('Year of Funding')
  .attr('transform', 'translate(' + [width / 2 - 50, containerHeight - 60] + ')');


vis.selectAll("path.industries")
    .data(data)
  .enter().append("path")
    .attr('class', function(d,i) {
      return 'industry-' + d[m-1].category_code;
    })
    .style("fill", function(d, i) { 
      return custom_color(d[m-1].category_code); 
    })

    .transition()
      .duration(500)
      .attr("d", area)


    vis.append("g")
      .attr("transform", "translate(" + [0, 0] + ")")
      .call(y_axis);
    var x = function(d) { return d.x * width / mx; }
    var labels = vis.selectAll("text.label")
      .data(data[0])
    .enter().append("text")
      .attr("class", "label")
      .attr("x", function(d) { return d.x * width / mx - width/m/2; })
      .attr("y", height + 6)
      .attr("dx", x({x: .45}))
      .attr("dy", ".71em")
      .attr("text-anchor", "middle")
      .text(function(d, i) { return i + minYear; });
    var groupYearQuery = vis.selectAll("g.yearQuery")
      .data(data[0])
      .enter().append("svg:g")
        .attr("class", "yearQuery")
        .attr({
          transform: function(d,i){ 
            return 'translate(' + [(d.x * width / mx) - width / mx/ 2, 0 ] + ')';
          }
        })
        .style("opacity", .5)
        .on("mouseover", function(d,i){ d3.select(this).select('line').style("stroke", 'blue').style("stroke-width", 2);})
        .on("mouseout", function(d,i){ d3.select(this).select('line').style("stroke", '#dddddd').style("stroke-width", 1);});
    var queryLines = groupYearQuery.append("svg:line")
      .attr({
        x1: width/mx/2,
        x2: width/mx/2,
        y1: 0,
        y2: height
      })
      .style("stroke", "#eeeeee");
    var queryRects = groupYearQuery.append("svg:rect")
      .attr({
          width: width/mx,
          height: height,
      }).style("opacity", 0);
});

var durationTime = 500;

var category_sort = function(a,b){
  return b.total_amount - a.total_amount;
}

function retotalNewCategories(year) {
  for (var key in categories) {
    categories[key].total_amount = 0;
  }

  new_categories.forEach( function(category) {
    category.total_amount = 0;
  })

  for( var i = 0 ; i < json.length; i ++) {
  
    if ( json[i]._id.funding_year == year ) {
      categories[json[id]._id.category_code] += json[id].value.total_amount;
    }

    for (var key in categories) {
      for ( var i = 0; i < new_categories.length; i ++ ) {
        if ( new_categories[i].category_code === key ) {
          new_categories[i].total_amount = categories[key].total_amount
        } 
      }
    }

  }
}

console.log( new_categories );

function redrawLegend(){
  legend_groups.data(new_categories, function(d){ return d.category_code })
    .transition()
    .duration(function(d,i){ return 400 + i * 75})
    .attr('transform', function(d,i) {
      var x = 0;
      return 'translate(' + x + ',' + (23.5 * i)  +')'; 
    })
}
