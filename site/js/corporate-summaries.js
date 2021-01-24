var handle2corp = {};
var corp2handle = {};

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
      if (tag == 'Juneteenth') { tag_html += `<span class="badge badge-pill badge-danger">Juneteenth</span>` }
    })
    tag_html += "</div>"
    return tag_html
  }
}

function reset_form() {
  $('#tag_highlighter').val('')
  $('#sector_filter').val('')
  $('#hide_context').prop('checked', false);

  // HACK: for some reason these changes do not register their attached functions
  //   so we'll have to reset everything manually
  $('.corp_section').css({'display': 'block'})
  $('.corp_context').css({'display': 'block'})
  d3.selectAll('circle').style('stroke', 'none')
}

function update_jump_to() {
  var visible_blocks = $('.corp_section').filter(function() { return $(this).css('display') == 'block' });

  var jump_to_list = [];
  visible_blocks.each(function() {
    
    var handle = $(this).attr('id')
    var jump_to_string = `<div class="jump_to_item" id="jump_to_${handle}"><a class="white_link" href="#${handle}">${handle2corp[handle]}</a></div>`
    jump_to_list.push(jump_to_string)
  });
 
  $('#jump_to_items').html(jump_to_list.join(' · ')) // 
}

function add_jump_to_listeners() {
  // To update jump_to, listen for style updates to all sector blocks
  var observer = new MutationObserver(function(mutations) {
    update_jump_to();
  });

  var targets = document.getElementsByClassName('corp_section');
  Array.from(targets).forEach(function (target) {
    // console.log(target);
    observer.observe(target, { attributes : true, attributeFilter : ['style'] });
  })
}


$(document).ready(function () {
  check_mobile();
  add_jump_to_listeners();

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
      $(`[sector="${new_sector}"]`).css({'display': 'block'})
    }
  });

  $('#tag_highlighter').change(function() {
    new_tag_highlight = $('#tag_highlighter').val();
    
    d3.selectAll('circle').style('stroke', 'none')
    
    d3.selectAll(`[tags*="${new_tag_highlight}"]`)
      .style('stroke', 'blue')
      .style('stroke-width', 13)
      .style('stroke-opacity', 0.3)

  })

  // set the dimensions and margins of the graph
  var margin = { top: 5, right: 5, bottom: 20, left: 15 },
    width = 550 - margin.left - margin.right;

  var minDate = new Date("2020-05-24");
  var maxDate = new Date("2020-07-26");

  //Read the data
  d3.json(
    "https://raw.githubusercontent.com/kmcelwee/fortune-100-blm-report/main/docs/twitter-oembeds.json",
    function (oembed_json) {
      d3.json(
        "https://raw.githubusercontent.com/kmcelwee/fortune-100-blm-report/main/docs/histogram.json",
        function (histogram_data) {
          handle2corp = histogram_data['handle2corp']
          corp2handle = histogram_data['corp2handle']

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
              .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
              .attr('preserveAspectRatio', 'xMidYMid meet')
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
              .attr("tags", (d) => d.tags)
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
                  .attr("r", 5);
              })

              .on("mouseout", function (d) {
                div.transition().duration(0).style("opacity", 0);
                // expand on hover
                d3.select(this).attr("r", 3);
              });
          }
        }
      );
    }

    
  );
  
});
