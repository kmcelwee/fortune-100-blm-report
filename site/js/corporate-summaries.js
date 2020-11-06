function check_mobile() {
    var mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
    if (mobile) { alert("This page is meant to be viewed on a desktop. Some features will not be available on a mobile device."); } 
}

function parse_tags(tags) {
  if (tags == '') { return ''; }
  else {
    tag_html = `<div class="tag-tooltip-container"> Tags: `
    tags.split(';').forEach(function(tag) {
      if (tag == 'Money') { tag_html += `<span class="badge badge-pill badge-success">Money</span>` }
      if (tag == 'BLM') { tag_html += `<span class="badge badge-pill badge-light">BLM</span>` }
      if (tag == 'Formal Statement') { tag_html += `<span class="badge badge-pill badge-primary">Formal Statement</span>` } 
      if (tag == 'Juneteenth') { tag_html += `<span class="badge badge-pill badge-danger">Juneteenth</span>` }
    })
    tag_html += "</div>"
    return tag_html
  }
}

$(document).ready(function () {
  check_mobile();

  // Add control box functionality
  $('#hide_context').change(function() {
    if(this.checked) {
      $('.corp_context').css({'display': 'none'})
    }
    else {
      $('.corp_context').css({'display': 'block'})
    }
  });

  $('#sector_filter').change(function() {
    new_sector = $('#sector_filter').val();
    if (new_sector == '') {
      $('.corp_section').css({'display': 'block'})
    } else {  
      $('.corp_section').css({'display': 'none'})
      $(`[sector=${new_sector}]`).css({'display': 'block'})
    }
  });

  // set the dimensions and margins of the graph
  var margin = { top: 35, right: 60, bottom: 30, left: 60 },
    width = 650 - margin.left - margin.right;

  var minDate = new Date("2020-05-24");
  var maxDate = new Date("2020-07-26");

  //Read the data
  d3.json(
    "https://raw.githubusercontent.com/kmcelwee/fortune-100-blm-report/main/docs/twitter-oembeds.json",
    function (oembed_json) {
      d3.json(
        "https://raw.githubusercontent.com/kmcelwee/fortune-100-blm-report/main/docs/histogram.json",
        function (histogram_data) {
          // Iterate through corporations
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
                  .html("<br>" + oembed_json[d.ID]["html"] + parse_tags(d.tags))
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
