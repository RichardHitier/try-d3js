function build_chart() {
    const y_num_ticks = 10;
    const main_elt = document.getElementById("body");
    const margin = {'top': 40, 'right': 10, 'bottom': 140, 'left': 120},
        width = main_elt.offsetWidth * 0.95 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        bar_width = 8;

    const x = d3.scaleTime()
        .range([0, width]);

    const y = d3.scaleLinear()
        .range([height, 0]);

    d3.selectAll('svg').remove();
    let svg = d3.select('#chart_cyclo_bar')
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
            d.date = new Date(d.date);
            d.distance = +d.distance;
            d.deniv = +d.deniv;
        });

        let ten_days_millisecs = 1000 * 60 * 60 * 24 * 10;
        let dates = data.map(d => d.date);
        let first_date = d3.min(dates);
        first_date = new Date(first_date.getTime() - ten_days_millisecs);
        let last_date = Date.now();
        x.domain([first_date, last_date]);
        y.domain([0, d3.max(data, d => d.distance) + 10]);

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
            .call(d3.axisLeft(y).ticks(y_num_ticks));

        svg.selectAll("y axis")
            .data(y.ticks(y_num_ticks))
            .enter()
            .append("line")
            .attr("class", d => (d === 0 ? "horizontalY0" : "horizontalY"))
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => y(d))
            .attr("y2", d => y(d));
        //.lower();// set it below bars if called after


        let dateOptions = {weekday: 'short', year: '2-digit', month: 'long', day: 'numeric'};
        let formatTime = d3.timeFormat("%B %d, %Y");
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", d => d.mode)
            .attr("x", d => x(d.date))
            .attr("width", bar_width)
            .attr("y", d => y(d.distance))
            .attr("height", d => height - y(d.distance))
            .on("mouseover", function (e, d) {
                // d3.select(this).attr("class", "hover");
                tooltip.attr("class", d.mode);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<div class='tooltip-date'>" + d.mode + ': ' + d.date.toLocaleDateString('fr-FR', dateOptions) + '</div>' +
                    "<div class='tooltip-title'>" + d.nom + "</div>" +
                    "distance : " + d.distance + " km<br>" +
                    "durée: " + d.temps)
                    .style("left", e.pageX + "px")
                    .style("top", margin.top + "px");
                // .style("top", (e.pageY - 200) + "px");
            })
            // .on("mousemove", function (e, d) {
            //   tooltip
            //       .style("left", (e.pageX + 0) + "px")
            //       .style("top", (e.pageY - 200) + "px");
            // })
            .on("mouseout", function () {
                d3.select(this).attr("class", d => d.mode);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        let yDeniv = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.deniv)])
            .range([height, 0]);

        let dataDeniv = data.filter(item => item.mode === 'velo');

        let my_line = d3.line()
            .x(d => x(d.date))
            .y(d => yDeniv(d.deniv))
            .curve(d3.curveMonotoneX)
        ;

        let deniv_g = svg.append('g')
            .attr('transform', 'translate(' + bar_width / 2 + ',0)');

        deniv_g.append("path")
            .datum(dataDeniv)
            .attr("fill", "none")
            .attr("stroke", "darkolivegreen")
            .attr("stroke-width", 2)
            .attr("d", my_line);

        deniv_g.selectAll('.data-circle')
            .data(dataDeniv)
            .enter().append('circle')
            .attr("class", "data-circle")
            .attr("r", 4)
            .attr("cx", d => x(d.date))
            .attr("cy", d => yDeniv(d.deniv))
            .on("mouseover", function (e, d) {
                d3.select(this).attr("r", 8);
                tooltip.attr("class", 'deniv');
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Dénivelé: " + d.deniv + " m<br>")
                    .style("left", e.pageX + "px")
                    .style("top", (e.pageY - 50) + "px");
            })
            .on("mouseout", function (e, d) {
                d3.select(this).attr("r", 5);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
        ;
    });

}
