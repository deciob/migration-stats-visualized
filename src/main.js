function parseData(data, years) {
  const filteredData = years ? data.filter(d => years.find(year => d.year === year)): data;
  const parsedData = filteredData.map((d) => {
    if (d.variable === 'outflow') {
      d.value = -d.value;
    }
    return d;
  })
  .reduce((acc, data) => {
    const element = acc.find(d => d.coCode == data.coCode);
    if (element) {
      element[data.variable] += data.value;
    } else {
      let newElement = {
        asylumInflow: 0,
        coCode: data.coCode,
        country: data.country,
        foreignInflow: 0,
        outflow: 0,
      };
      newElement[data.variable] = data.value;
      acc.push(newElement);
    }
    return acc;
  }, []);

  return parsedData;
}

function parseDataForOverview(data) {
  const parsedData = data
  .map((d) => {
    if (d.variable === 'outflow') {
      d.value = -d.value;
    }
    return d;
  })
  .reduce((acc, data) => {
    const element = acc.find(d => d.year == data.year);
    if (element) {
      switch (data.variable) {
        case 'asylumInflow':
          element.asylumInflow += data.value;
          break;
        case 'foreignInflow':
          element.foreignInflow += data.value;
          break;
        case 'outflow':
          element.outflow += data.value;
          break;
        default:
          console.log('error!');
      }
    } else {
      let newElement = {
        asylumInflow: 0,
        foreignInflow: 0,
        outflow: 0,
        year: data.year,
      };
      acc.push(newElement);
    }
    return acc;
  }, []);

  return parsedData;
}

function drawChart(data, yDomain) {
  const element = document.getElementById(data[0].coCode);
  const chartContainer = d3.select(element);
  const barChart = d3.barChart();
  const duration = 600;
  const xAxis = d3.axisBottom().tickSizeOuter(0);
  const yAxis = d3.axisLeft().ticks(4, 's').tickSizeOuter(0);

  barChart
    .layout('verticalStacked')
    .divergin(true)
    .fixedAxis(false)
    .width(parseInt(element.parentElement.clientWidth, 10))
    .height(parseInt(element.parentElement.clientHeight, 10))
    .schemeCategory(['#fdae61', '#f46d43', '#abd9e9'])
    .stackedKeys(['foreignInflow', 'asylumInflow', 'outflow'])
    .transitionDuration(duration)
    .yAxis(yAxis)
    .yDomain(yDomain)
    .xAxis(xAxis)
    .xAccessor(d => d.country)
    .transitionStepSeed(0)
    .margin({top: 10, left: 40, right: 20, bottom: 30});

  chartContainer.datum(data).call(barChart);
}


function drawChartOverview(data) {
  const element = document.getElementById('overview');
  const chartContainer = d3.select(element);
  const barChart = d3.barChart();
  const duration = 600;
  const xAxis = d3.axisBottom().tickSizeOuter(0);
  const yAxis = d3.axisLeft().ticks(2, 's').tickSizeOuter(0);

  barChart
    .layout('verticalStacked')
    .divergin(true)
    .brushShow(true)
    .width(parseInt(element.parentElement.clientWidth, 10))
    .height(parseInt(element.parentElement.clientHeight, 10))
    .schemeCategory(['#fdae61', '#f46d43', '#abd9e9'])
    .stackedKeys(['foreignInflow', 'asylumInflow', 'outflow'])
    .transitionDuration(duration)
    .yAxis(yAxis)
    .xAxis(xAxis)
    .xAccessor(d => d.year)
    .transitionStepSeed(0)
    .margin({top: 2, left: 40, right: 20, bottom: 20});

  chartContainer.datum(data).call(barChart);
  return barChart;
}


// const drawChart = () => {
//   if (currentYear < 2016) {
//     const data = parseData(res, currentYear);
//     chartContainer.datum(data).call(barChart);
//   } else {
//     window.clearInterval(chartTimer);
//   }
//   currentYear += 1;
// };


fetch('../data/data.json')
  .then((res) => res.json())
  .then((res) => {
    let allData = parseData(d3.helpers.clone(res));
    const overviewData = parseDataForOverview(d3.helpers.clone(res));

    let yDomain = [
      d3.min(allData, d => d.outflow),
      d3.max(allData, d => d.foreignInflow + d.asylumInflow)
    ];

    const overviewChart = drawChartOverview(overviewData);

    overviewChart.subscribe(
      'UPDATE_X_DOMAIN',
      ((state) => {
        allData = parseData(d3.helpers.clone(res), state.xDomain);
        yDomain = [
          d3.min(allData, d => d.outflow),
          d3.max(allData, d => d.foreignInflow + d.asylumInflow)
        ];
        allData.forEach((d) => {
          drawChart([d], yDomain);
        });
      }),
    );

    allData.forEach((d) => {
      drawChart([d], yDomain);
    });
  });
