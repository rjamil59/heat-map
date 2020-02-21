d3.json("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json", createMap);

function createMap(data) {
    console.log("data: ", data);
    const w = 3 * Math.ceil(data.monthlyVariance.length / 12),
        h = 400,
        p = {
            left: 80,
            rigth: 80,
            top: 20,
            bottom: 50
        };

    const tooltip = d3.select(".map")
        .append("div")
        .attr("id", "tooltip");

    const svg = d3.select(".map")
        .append("svg")
        .attr("width", w + p.left + p.right)
        .attr("height", h + p.top + p.bottom);

    data.monthlyVariance.forEach(function (val) {
        val.month -= 1;
    });

    // CREATION AXISES
    const xScale = d3.scale.ordinal()
        .domain(data.monthlyVariance.map(function (val) {
            return val.year
        }))
        .rangeRoundBands([0, w], 0, 0);

    const yScale = d3.scale.ordinal()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .rangeRoundBands([0, h], 0, 0);


    const xAxis = d3.svg.axis()
        .scale(xScale)
        .tickValues(xScale.domain().filter(function (year) {
            //set ticks to years divisible by 10
            return year % 10 === 0;
        }))
        .tickFormat(function (year) {
            var date = new Date(0);
            date.setUTCFullYear(year)
            return d3.time.format.utc("%Y")(date);
        })
        .orient("bottom")
        .tickSize(10, 1);

    const yAxis = d3.svg.axis()
        .scale(yScale)
        .tickValues(yScale.domain())
        .tickFormat(function (month) {
            var date = new Date(0);
            date.setUTCMonth(month);
            return d3.time.format.utc("%B")(date);
        })
        .orient("left")
        .tickSize(10, 1);

    svg.append("g")
        .classed("x-axis", true)
        .attr("id", "x-axis")
        .attr("transform", "translate(" + p.left + "," + (h + p.top) + ")")
        .call(xAxis);

    svg.append("g")
        .classed("y-axis", true)
        .attr("id", "y-axis")
        .attr("transform", "translate(" + p.left + "," + p.top + ")")
        .call(yAxis);

    // HANDLE COLORS 
    const colours = ['#008080', '#3c9986', '#5fb28e', '#83cb9a', '#ace4ab', '#def8c8', '#ffe5d4', '#ffb1b7', '#f47e94', '#dd4e6c', '#ba213e', '#8b0000'];
    const zScale = d3.scale.quantize().range(colours);
    const baseTemp = data.baseTemperature;
    zScale.domain(d3.extent(data.monthlyVariance, function (d) {
        return d.variance + baseTemp;
    }));

    // HANDLE MAP DATA 
    svg.append("g")
        .classed("map", true)
        .attr("transform", "translate(" + p.left + "," + p.top + ")")
        .selectAll("rect")
        .data(data.monthlyVariance)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-month", function (d) {
            return d.month;
        })
        .attr("data-year", function (d) {
            return d.year;
        })
        .attr("data-temp", function (d) {
            return data.baseTemperature + d.variance;
        })
        .attr({
            x: function (d, i) {
                return xScale(d.year);
            },
            y: function (d, i) {
                return yScale(d.month);
            },
            width: function (d, i) {
                return xScale.rangeBand(d.year);
            },
            height: function (d, i) {
                return yScale.rangeBand(d.month);
            }
        })
        .attr("fill", function (d) {
            return zScale(d.variance + baseTemp);
        })
        .on("mouseover", function (d) {
            var date = new Date(d.year, d.month);
            var str = "<span class='date'>" + d3.time.format("%Y - %B")(date) + "</span>" + "<br />" +
                "<span class='temperature'>" + d3.format(".1f")(data.baseTemperature + d.variance) + "&#8451;" + "</span>" + "<br />" +
                "<span class='variance'>" + d3.format("+.1f")(d.variance) + "&#8451;" + "</span>";
            tooltip.attr("data-year", d.year)
                .style('display', 'block')
                .html(str)
                .style("left", (d3.event.pageX - 50) + "px")
                .style("top", (d3.event.pageY - 5) + "px");
        })
        .on("mouseout", function (d, i) {
            tooltip.style("display", "none");
        });

    // LEGEND 
    const legend = d3.select(".heatMap")
        .append("ul");

    const keys = legend.selectAll("li.key")
        .data(zScale.range());

    keys.enter()
        .append("li")
        .attr("class", "key")
        .attr("id", "legend")
        .style("border-top-color", String)
        .text(function (d) {
            var r = zScale.invertExtent(d);
            return (r[0].toFixed(1));
        });

};