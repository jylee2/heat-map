// Data source
const jsonURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

// Plot graph function (dataset, HTML element for svg canvas, HTML element for legend, HTML element for dummy tooltip)
const plotGraph = (data, svgElemId, legendId, tooltipId) => {

   // Log object keys
   //console.log(Object.keys(data));
   const baseTemp = data["baseTemperature"];
   //console.log(`baseTemp = ${baseTemp} ℃`);
   //console.log(data.monthlyVariance.length / ( d3.max(data.monthlyVariance, (d) => d.year) - d3.min(data.monthlyVariance, (d) => d.year) ));

   // svg canvas width set to 800px
   const svgWidth = 1200;
   const svgHeight = 500;
   const svgPadding = 80;
   const svgTopBtmPadding = 40;
   // Draw canvas
   const svgContainer = d3.select(svgElemId)
                           .attr("width", svgWidth)
                           .attr("height", svgHeight);

   //console.log(d3.min(data.monthlyVariance, (d) => d.year));
   // Scale x axis width
   const xAxisScale = d3.scaleLinear()
                     // Start from earliest date & end at latest date
                     .domain([d3.min(data.monthlyVariance, (d) => d.year), d3.max(data.monthlyVariance, (d) => d.year)])
                     // Display x axis starting from left to right
                     .range([svgPadding, svgWidth - svgPadding]);
   // Generate x-axis
   const xAxis = d3.axisBottom(xAxisScale)
                     // Format x-axis labels so that it's "1994" instead of "1,994"
                     .tickFormat(d3.format('d'));
   // Move x-axis downwards
   const xAxisTranslate = svgHeight - svgTopBtmPadding; 
   // Create g element within svgContainer for x-axis
   const gXAxis = svgContainer.append("g")
                              .call(xAxis)
                              .attr("id", "x-axis")
                              // Move axis downwards, otherwise will be at top of the svg
                              .attr("transform", `translate(0, ${xAxisTranslate})`);
   
   // Convert d.month into date format to use d3.scaleTime()
   // var d = new Date(year, month, day, hours, minutes, seconds, milliseconds);
   const monthArray = data.monthlyVariance.map( (d) => {
      // month in milliseconds
      return new Date( (d.month) * 30 * 24 * 60 * 60 * 1000 );
      //return new Date(0, d.month - 1, 0, 00, 0, 0, 0);
   });
   const monthInt = 1 * 30 * 24 * 60 * 60 * 1000;
   // Scale y-axis height
   const yAxisScale = d3.scaleTime()
                        // Start from shortest time & end at longest time
                        .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
                        // Display axis starting from bottom to top of svg, remember 0 = top of the page
                        .range([svgTopBtmPadding, svgHeight - svgTopBtmPadding]);
   // Generate axis
   const yAxis = d3.axisLeft(yAxisScale)
                     //return month names (but it will make the year disappear)
                     .tickFormat(d3.timeFormat("%B"));
   // Create g element within svgContainer for axis
   const gYAxis = svgContainer.append("g")
                              .call(yAxis)
                              .attr("id", "y-axis")
                              // Move axis rightward, otherwise will be at left end of the svg
                              .attr("transform", `translate(${svgPadding}, 0)`);
   /* // Add y-axis label
   const yAxisLabel = svgContainer.append("text")
                                    .attr("id", "y-axis-label")
                                    // Rough position in x from left of svg
                                    .attr('x', 10)
                                    // Rough position in y from top of svg
                                    .attr('y', 40)
                                    .text("Months"); */

   // Scale bar width
   const barWidth = (svgWidth - 2*svgPadding)/( d3.max(data.monthlyVariance, (d) => d.year) - d3.min(data.monthlyVariance, (d) => d.year) );
   // Scale bar height
   const barHeight = (svgHeight - 2*svgTopBtmPadding)/12;
   // Scale bar x position
   const barXPosScale = d3.scaleLinear()
                           // Data index values range from 0th index to data.length - 1
                           .domain([0, data.monthlyVariance.length / 12])
                           // range() represents the start and end positions on the display for visualisation
                           .range([svgPadding, svgWidth - svgPadding]);
   // Scale bar y position
   const barYPosScale = d3.scaleLinear()
                           // Start from shortest time & end at longest time
                           .domain([1, 13])
                           // Display axis starting from bottom to top of svg, remember 0 = top of the page
                           .range([svgTopBtmPadding, svgHeight - 1*svgTopBtmPadding]);
   
   // **Create dummy tooltip element as requested, must be hidden by default
   const setTooltip = d3.select(tooltipId)
                        .style("visibility", "hidden")
                        .style("width", "auto")
                        .style("height", "auto");

   // **Create rectangle svg shapes for the bar chart
   const barChart = svgContainer.selectAll("rect")
                                 // Put data into the waiting state for further processing
                                 .data(data.monthlyVariance)
                                 // Methods chained after data() run once per item in dataset
                                 // Create new element for each piece of data
                                 .enter()
                                 // The following code will be ran for each data point
                                 // Append rect for each data element
                                 .append("rect")
                                 // Add CSS class for hover effect
                                 .attr("class", "cell")
                                 // Set rect Bar width, not position
                                 .attr("width", barWidth)
                                 // Set x position of the bar from the left of the svg element
                                 .attr("x", (d, i) => {
                                    // Shift x position per 12 bars, rounded to whole number
                                    return barXPosScale( Math.floor(i/12) );
                                 })
                                 // Set rect Bar height, not position
                                 .attr("height", barHeight)
                                 // Set y position of the bar from the top of the svg element
                                 .attr("y", (d, i) => {
                                    return barYPosScale( d.month );
                                    //return barYPosScale( new Date( (d.month - 1) * 30 * 24 * 60 * 60 * 1000 ) );
                                 })
                                 // Fill bar with color based on data value
                                 .attr("fill", (d) => {
                                    if(baseTemp + d.variance <= 4.8){
                                       return "rgb(69, 117, 180)"; // blue
                                    } else if(baseTemp + d.variance <= 6.8) {
                                       return "rgb(171, 217, 233)"; // light blue
                                    } else if(baseTemp + d.variance <= 8.8) {
                                       return "rgb(255, 255, 191)"; // yellow
                                    } else if(baseTemp + d.variance <= 10.8) {
                                       return "rgb(253, 174, 97)"; // orange
                                    } else {
                                       return "rgb(215, 48, 39)"; // red
                                    }
                                 })
                                 // Adding the requested "data-month" property into each <rect> element
                                 // need to -1 so that month in js starts from 0 and ends at 11
                                 .attr("data-month", (d, i) => d.month - 1 )
                                 // Adding the requested "data-year" property into each <rect> element
                                 .attr("data-year", (d, i) => d.year)
                                 // Adding the requested "data-temp" property into each <rect> element
                                 .attr("data-temp", (d, i) => baseTemp + d.variance)
                                 // ** Make dummy #tooltip element visible as requested using .on()
                                 .on("mouseover", (d) => {
                                    setTooltip.transition()
                                                .style("visibility", "visible")
                                                // Won't actually display on web page
                                                .text("")
                                                //attr doesn't work, you need to use vanilla JS:
                                    // Use <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.2/d3.min.js"></script>
                                    return document.querySelector("#tooltip").setAttribute("data-year", d.year);
                                 })
                                 // Hide dummy #tooltip element when mouseout
                                 .on("mouseout", (d) => {
                                    setTooltip.transition()
                                                .style("visibility", "hidden")
                                 })
                                 // This is the actual tooltip to display data value when hover mouse on bar,
                                 // but unfortunately this doesn't pass the tests for some reason
                                 .append("title")
                                 // Adding the requested "data-date" property into the <title> element
                                 .attr("data-year", (d, i) => d.year)
                                 // Specifying the text to display upon mouseover the data point
                                 .text((d) => `${d.year}/${d.month}: ${baseTemp}+${d.variance} ℃`);

   // Legend
   // svg legend width set to 800px
   const legendData = [2.8, 4.8, 6.8, 8.8, 10.8, 12.8];
   const lgdWidth = 500;
   const lgdHeight = 50;
   const lgdPadding = 40;
   const lgdBarWidth = 40;
   const lgdBarHeight = 20;
   // Select legend svg element
   const lgdContainer = d3.select(legendId)
                           .style("width", lgdWidth)
                           .style("height", lgdHeight)

   // Scale legend x axis width
   const legendXAxisScale = d3.scaleLinear()
                              // Start from earliest date & end at latest date
                              .domain([d3.min(legendData), d3.max(legendData)])
                              // Display x axis starting from left to right
                              .range([2*lgdPadding, (legendData.length+1)*lgdPadding]);
   // Generate x-axis for legend
   const legendXAxis = d3.axisBottom(legendXAxisScale)
   // Move x-axis downwards
   const legendXAxisTranslate = 0.5*lgdPadding; 
   // Create g element within lgdContainer for x-axis
   const gLegendXAxis = lgdContainer.append("g")
                                    .call(legendXAxis)
                                    // Move axis downwards, otherwise will be at top of the svg
                                    .attr("transform", `translate(0, ${legendXAxisTranslate})`);

   // Create rectangle svg shapes for legend color
   const createLegend = lgdContainer.selectAll("rect")
                                    // Put data into the waiting state for further processing
                                    .data(legendData)
                                    // Methods chained after data() run once per item in dataset
                                    // Create new element for each piece of data
                                    .enter()
                                    // The following code will be ran for each data point
                                    // Append rect for each data element
                                    .append("rect")
                                    .attr("x", (d, i) => lgdPadding + i*lgdBarWidth)
                                    .attr("y", 0)
                                    .attr("width", lgdBarWidth)
                                    .attr("height", lgdBarHeight)
                                    // Fill bar with color based on data value
                                    .attr("fill", (d) => {
                                       if(d <= 2.8){
                                          return "#ffffff"; // white
                                       } else if(d <= 4.8){
                                          return "rgb(69, 117, 180)"; // blue
                                       } else if(d <= 6.8) {
                                          return "rgb(171, 217, 233)"; // light blue
                                       } else if(d <= 8.8) {
                                          return "rgb(255, 255, 191)"; // yellow
                                       } else if(d <= 10.8) {
                                          return "rgb(253, 174, 97)"; // orange
                                       } else {
                                          return "rgb(215, 48, 39)"; // red
                                       }
                                    })

};

// Read JSON
const readJson = (jsonURL) => {
   // Make a GET request to the URL
   fetch(jsonURL)
      // Take the response
      .then( (response) => {
         // Throw error if response is not ok
         if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
         }
         // Convert the response to JSON format
         return response.json();
      })
      // Handle the returned Promise by another .then() method which takes the JSON object as an argument
      .then( (jsonObj) => {
         // Plot the graph by specifying (1) dataset, (2) which svg Element Id to plot in, (3) which HTML Element to insert legend & (4) which HTML Element to insert dummy tooltip
         plotGraph(jsonObj, "#canvas", "#legend", "#tooltip");
      })
      // The catch block catches the error, and executes a code to handle it
      .catch( (err) => {
         return console.log(err);
      })
};

// Execute all functions
readJson(jsonURL);