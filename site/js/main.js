var test;

$(document).ready(function() {
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 650 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  var minDate = new Date("2020-05-24");
  var maxDate = new Date("2020-07-26");

  //Read the data
  d3.json("https://raw.githubusercontent.com/kmcelwee/fortune-100-blm-report/main/docs/histogram.json", function(data) {
    var company = 'AT&T';
    company_data = data[company];
    test = company_data;

    // Add X axis
    var x = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 15])
      .range([ height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add title
    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 + margin.top)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(company);

    // Add Legend

    // Add dots
    svg.append('g')
      .selectAll("dot")
      .data(company_data)
      .enter()
      .append("circle")
        .attr("cx", d => x(new Date(d['date'])))
        .attr("cy", d => y(d.count))
        .attr("r", 3)
        .style("fill", d => d['Racial Justice'] ? "#000" : "lightgrey" )
  })
});