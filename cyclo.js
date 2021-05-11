function build_chart() {
    const main_elt = document.getElementById("body");
    const margin = {'top': 40, 'right': 10, 'bottom': 140, 'left': 120},
        width = main_elt.offsetWidth * 0.95 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const x = d3.scaleTime()
        .range([0, width])

    const y = d3.scaleLinear()
        .range([height, 0])

    d3.selectAll('svg').remove();
    var svg = d3.select('#chart_cyclo_bar')
        .append('svg')
        .attr('id', 'svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // var	parseDate = d3.time.format("%Y-%m").parse;
    const tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

    d3.csv("./cyclo.csv").then(data => {
        data.forEach(function (d) {
            d.date = new Date(d.date)
            d.distance = +d.distance;
        });

        var ten_days_millisecs = 1000 * 60 * 60 * 24 * 10
        var dates = data.map(d => d.date)
        var first_date = d3.min(dates)
        first_date = new Date(first_date.getTime() - ten_days_millisecs)
        var last_date = d3.max(dates)
        last_date = new Date(last_date.getTime() + ten_days_millisecs)
        x.domain([first_date, last_date])
        y.domain([0, d3.max(data, d => d.distance)])

        svg.append("g")
            .attr('transform', 'translate(0,' + height + ')')
            .call(
                d3.axisBottom(x)
                    .ticks(d3.utcWeek)
                    .tickFormat(d3.timeFormat("%b %d"))
                    .tickSize(5)
            )
            .selectAll("text")
            .style("text-anchor", 'end')
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        svg.append("g")
            .call(d3.axisLeft(y).ticks(1))

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", d => d.mode)
            .attr("x", d => x(d.date))
            .attr("width", 7)
            .attr("y", d => y(d.distance))
            .attr("height", d => height - y(d.distance))
            .on("mouseover", function (e, d) {
                d3.select(this).attr("class", "hover")
                tooltip.attr("class", d.mode);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<b>" + d.nom + "</b><br>distance : " + d.distance + " km<br>durée: " + d.temps)
                    .style("left", (e.pageX + 0) + "px")
                    .style("top", margin.top + "px");
                // .style("top", (e.pageY - 200) + "px");
            })
            // .on("mousemove", function (e, d) {
            //   tooltip
            //       .style("left", (e.pageX + 0) + "px")
            //       .style("top", (e.pageY - 200) + "px");
            // })
            .on("mouseout", function (d) {
                d3.select(this).attr("class", d => d.mode);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });

}
