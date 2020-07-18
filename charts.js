const buildChartData = (data) => {
let chartData = {
    'cases':{
        label: 'Daily New Cases',
        backgroundColor: 'rgba(29, 44, 77, 0.5)',
        borderColor: '#1d2c4d',
        borderWidth: 2,
        pointRadius: 0,
        data: []
    },
    'recovered':{
        label: 'Daily Recovered',
        backgroundColor: 'rgba(125, 215, 29, 0.5)',
        borderColor: '#7dd71d',
        borderWidth: 2,
        pointRadius: 0,
        data: []
    },
    'deaths':{
        label: 'Daily Deaths',
        backgroundColor: 'rgba(204, 16, 52, 0.5)',
        borderColor: '#CC1034',
        borderWidth: 2,
        pointRadius: 0,
        data:[]
    }
};

    let lastDataPointCases;
    let lastDataPointRecovered;
    let lastDataPointDeaths;
    for(let date in data.cases){
        if(lastDataPointCases) {
            let newDataPoint = {
                x: date,
                y: data.cases[date]-lastDataPointCases
            }
            
            chartData.cases.data.push(newDataPoint);
        }
        lastDataPointCases = data.cases[date];
    }
    for(let date in data.recovered){
        if(lastDataPointRecovered) {
            let newDataPoint = {
                x: date,
                y: data.recovered[date]-lastDataPointRecovered
            }
            
            chartData.recovered.data.push(newDataPoint);
        }
        lastDataPointRecovered = data.recovered[date];
    }
    for(let date in data.deaths){
        if(lastDataPointDeaths) {
            let newDataPoint = {
                x: date,
                y: data.deaths[date]-lastDataPointDeaths
            }
            
            chartData.deaths.data.push(newDataPoint);
        }
        lastDataPointDeaths = data.deaths[date];
    }
    //console.log(chartData)
    return chartData;
}
let chart;
const buildChart = (chartData, type) => {
    
    if (chart) {chart.destroy()};

    const timeFormat = 'MM/DD/YY';
    let ctx = document.getElementById('myChart').getContext('2d');

    let dataset = {};

    if (type === 'recovered') {
        dataset = chartData.recovered;
    } else if (type === 'deaths') {
        dataset = chartData.deaths;
    } else {
        dataset = chartData.cases;
    }

    //console.log(dataset);

    chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            datasets: [dataset],
        }, 

        // Configuration options go here
        options: {
            maintainAspectRatio: false,
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';
    
                        if (label) {
                            label += ': ';
                        }
                        label += numeral(tooltipItem.yLabel).format('0,0');
                        return label;
                    }
                }
            },
            scales:     {
                xAxes: [{
                    type: "time",
                    time: {
                        format: timeFormat,
                        tooltipFormat: 'll'
                    }
                }],
                yAxes: [{
                    gridLines: {
                        display:false
                    },
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return numeral(value).format('0.0a').toUpperCase();
                        }
                    }
                }]
            }
        }
        
    });
}