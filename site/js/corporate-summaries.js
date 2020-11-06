corp_section_template = `
<div id="Walmart" class="corp_section">
    <div class="corp_header">
        <div class="corp_title">Walmart <a href="https://twitter.com/Walmart">(@Walmart)</a></div>
        <div class="corp_sector">Sector: Retailing</div>
    </div>
    <div id="Walmart-histogram"></div>
    <div class="corp_context">
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquam suscipit eum saepe dolorum, illo id dolores et laudantium eveniet explicabo provident, minus ratione, tempore quod nam, esse placeat quisquam. Asperiores.</p>
        <ul>
            <li><a href="https://google.com">CEO statement</a></li>
            <li><a href="https://google.com">Corporate tweet statement</a></li>
        </ul>
    </div>
</div>`

function check_mobile() {
    var mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
    if (mobile) { alert("This page is meant to be viewed on a desktop. Some features will not be available on a mobile device."); } 
}

$(document).ready(function () {
  check_mobile();
  // set the dimensions and margins of the graph
  var margin = { top: 35, right: 60, bottom: 30, left: 60 },
    width = 650 - margin.left - margin.right;
  // height = 200 - margin.top - margin.bottom;

  var minDate = new Date("2020-05-24");
  var maxDate = new Date("2020-07-26");

  //Read the data
  d3.json(
    "https://raw.githubusercontent.com/kmcelwee/fortune-100-blm-report/main/docs/twitter-oembeds.json",
    function (oembed_json) {
      d3.json(
        "https://raw.githubusercontent.com/kmcelwee/fortune-100-blm-report/main/docs/histogram.json",
        function (histogram_data) {
          for (company in histogram_data) {
            company_data = histogram_data[company];
            var handle = company_data["handle"];
            var height = company_data["max_count"] * 10;

            // append the svg object to the body of the page
            var svg = d3
              .select(`#${handle}-histogram`)
              .append("svg")
              .attr("class", "company_histogram")
              .attr("id", company_data["handle"])
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
              );

            // Add X axis
            var x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);
            svg
              .append("g")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x));

            // Add Y axis
            var y = d3
              .scaleLinear()
              .domain([0, company_data["max_count"]])
              .range([height, 0]);
            // .style('visibility', 'hidden');
            // svg.append("g").call(d3.axisLeft(y));

            // Add title
            // svg
            //   .append("text")
            //   .attr("x", 0)
            //   .attr("y", -10)
            //   // .attr("text-anchor", "middle")
            //   .style("font-size", "16px")
            //   .style("font-weight", "bold")
            //   // .style("text-decoration", "underline")
            //   .text(`@${handle} (${company})`);

            // Add Legend
            // svg.append("text")
            //      .attr("x", width)
            //      .attr("y", 0)
            //      .text("Racial Justice Tweet")

            // Define the div for the tooltip
            var div = d3
              .select("body")
              .append("div")
              .attr("class", "tooltip")
              .style("opacity", 0);

            // Add dots
            svg
              .append("g")
              .selectAll("dot")
              .data(company_data["tweets"])
              .enter()
              .append("a")
              .attr(
                "xlink:href",
                (d) => `https://twitter.com/att/status/${d.ID}`
              )
              .attr("target", "_blank")
              .append("circle")
              .attr("cx", (d) => x(new Date(d["date"])))
              .attr("cy", (d) => y(d.count - 0.25))
              .attr("r", 3)
              .style("fill", (d) =>
                d["Racial Justice"] ? "#000" : "silver"
              )
              .style("transition", "200ms")
              .on("mouseover", function (d) {
                div.transition().duration(200).style("opacity", 0.9);
                div
                  .html("<br>" + oembed_json[d.ID]["html"])
                  .style("left", d3.event.pageX + "px")
                  .style("top", d3.event.pageY - 28 + "px")
                  // Swap sides of tooltip if past halfway mark
                  .style("transform", (f) =>
                    x(new Date(d["date"])) > width / 2
                      ? "translateX(-305px)"
                      : "translateX(5px)"
                  );

                // expand on hover
                d3.select(this)
                  .style("stroke", (d) =>
                    d["Racial Justice"] ? "silver" : "black"
                  )
                  .attr("r", 5);
              })

              .on("mouseout", function (d) {
                div.transition().duration(0).style("opacity", 0);
                // expand on hover
                d3.select(this).style("stroke", "none").attr("r", 3);
              });
          }
        }
      );
    }
  );
});
