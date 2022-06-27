

var svgArea = d3.select("#scatter").select("svg");

// SVG wrapper dimensions are determined by the current width and
// height of the browser window.
var svgWidth = parseInt(d3.select("#scatter").style("width"))*0.80;
var svgHeight = svgWidth;

var margin = {
  top: 50,
  bottom: 50,
  right: 50,
  left: 50
};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// Append SVG element
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append group element
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  let obesityTotal = 0;
  let obesityCount = 0;
  let pathArray =[];

// Read CSV
d3.csv("assets/data/data.csv").then(function(data) {
  

//console.log(data);
        // parse data
  data.forEach(function(d) {
    d.poverty = +d.poverty;
    d.healthcare = +d.healthcare;
    d.obesity = +d.obesity;
    obesityTotal += +d.obesity;
    obesityCount += 1;
  });
  
  var dataSorted = data.slice().sort((a, b) => d3.descending(a.obesity, b.obesity))

  console.log("Obesity Count", obesityCount);
  console.log("Obesity Total", obesityTotal);
  
  let obesityAverage = obesityTotal/obesityCount;
  let obesityMin = d3.min(dataSorted, d => d.obesity);
  let obesityMax = d3.max(dataSorted, d => d.obesity);

  console.log("Obesity Average", obesityAverage);
  console.log("Obesity Min", obesityMin);
  console.log("Obesity Max", obesityMax);

  dataSorted.forEach(function(d){
    pathArray.push({
      xpath : 0,
      ypath : d.state,
      state : d.state
    }, 
    {
      xpath : +d.obesity - obesityAverage,
      ypath : d.state,
      state : d.state
    }
  
  )
  });
  console.log("Paths", pathArray)


    // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([ (obesityMin - obesityAverage)*1.1, (obesityMax - obesityAverage)*1.1])
    .range([0, width]);


  var yBandScale = d3.scalePoint()
    .domain(dataSorted.map(d => d.state))
    .range([0, height])
    .padding(0.6)
    .round(true)

  // create axes
  var xAxis = d3.axisBottom(xLinearScale);
  //xAxis.tickSize(-height);

  var yAxis = d3.axisLeft(yBandScale);

  // append axes
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  chartGroup.append("g")
    .attr("transform", `translate(${xLinearScale(0)},0)`)
    .call(yAxis);

  var groupedPaths = d3.nest() 
    .key(d => d.state)
    .entries(pathArray);

  console.log("Groups", groupedPaths)

  var graphArea = chartGroup.selectAll("lineGroup")
    .data(groupedPaths)
    .enter()

  var lineGroup = graphArea
    .append("path")
    .attr("d", function(d){
      return d3.line()
        .y(d => yBandScale(d.ypath))
        .x(d => xLinearScale(d.xpath)).curve(d3.curveCardinal)
        (d.values)
    })
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 4.5)
    .attr("funk", d => console.log("test", d));

    var circleGroup = graphArea.selectAll("circle")
    .data(dataSorted)
    .enter()
    .append("circle")
    .attr("r", 8)
    .attr("cy", d => yBandScale(d.state))
    .attr("cx", d => xLinearScale(d.obesity - obesityAverage))
    .attr("fill", "blue")
    .attr("opacity", "1");

}).catch(function(error) {
  console.log(error);
});

  