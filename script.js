
window.onload = () => {
    getCountryData();
    getChartData();
}


var map;
var infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 32, lng: -64},
    zoom: 3
  });
  infoWindow = new google.maps.InfoWindow();
}

const getCountryData = () => {
    fetch("https://corona.lmao.ninja/v2/countries")
    .then (response => response.json())
    .then((data)=>{
        showDataOnMap(data);
        showDataInTable(data);
    });
}

const getChartData = () => {
    fetch("https://corona.lmao.ninja/v2/historical/all?lastdays=90")
    .then ((response)=>{
        return response.json()
    }).then((data)=>{
        showDataInGraph(data);
    })
}
let countryCases = 0;
let countryRecovered = 0;
let countryDeaths = 0;

const checkForNull = (country) => {

    if (country.cases != null) {
        countryCases = country.cases;
    };

    if (country.recovered != null) {
        countryRecovered = country.recovered;
    };

    if (country.deaths != null) {
        countryDeaths = country.deaths;
    };  

}


const showDataOnMap = (data) => {
    data.map((country)=>{
        checkForNull(country);

        let countryCenter =  {
            lat:country.countryInfo.lat,
            lng:country.countryInfo.long
        }

        
        var countryCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: countryCenter,
            radius: countryCases
        });
        
        var html =` 
            <div class="info-container">
            <div class="info-flag" style=" background-image: url(${country.countryInfo.flag})" />
            </div>
            <div class="info-name">
                ${country.country}    
            </div>  
            <div class="info-confirmed">
                Total: ${countryCases.toLocaleString()}  
            </div>
            <div class="info-recovered">
                Recovered: ${countryRecovered.toLocaleString()}  
            </div>
            <div class="info-deaths">
                Deaths: ${countryDeaths.toLocaleString()}  
            </div>                   
            </div>
        `

        var infoWindow = new google.maps.InfoWindow({
            content: html,
            position: countryCircle.center
        });
  
        google.maps.event.addListener(countryCircle, 'mouseover', function() {
            infoWindow.open(map);
        });

        google.maps.event.addListener(countryCircle, 'mouseout', function(){
            infoWindow.close();
        });

    })

}


const showDataInTable =  (data) => {
    var html = '';
    data.forEach((country)=> {
        checkForNull(country);

        html +=` 
            <tr>
                <th scope="row">${country.country}</th>
                <td>${countryCases.toLocaleString()}</td>
                <td>${countryRecovered.toLocaleString()} </td>
                <td>${countryDeaths.toLocaleString()}</td>
            </tr>
        `
    })

    document.getElementById('table-data').innerHTML = html;
}

const showDataInGraph =  (data) => {
    let dateLabels = Object.keys(data.cases);
    let totalCases = Object.values(data.cases);
    let totalRecovered = Object.values(data.recovered);
    let totalDeaths = Object.values(data.deaths);

    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [{
                label: 'Cases',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                data: totalCases,
                fill: false,
            }, {
                label: 'Recovered',
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                data: totalRecovered,
            }, {
                label: 'Deaths',
                fill: false,
                backgroundColor: 'rgba(207, 0, 15, 0.2)',
                borderColor: 'rgba(207, 0, 15, 1)',
                data: totalDeaths,
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Total Worldwide Cases'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(tooltipItem, data) {
                        return ' ' + data.datasets[tooltipItem.datasetIndex].label + ': ' +  tooltipItem.yLabel.toLocaleString();
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: '# of Cases'
                    },
                    ticks: {
                        beginAtZero:true,
                        userCallback: function(value, index, values) {
                            return value.toLocaleString();
                        }
                    }
                }]
            }
        }
    });
}