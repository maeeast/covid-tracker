window.onload = () => {
    getCountriesData();
    getHistoricalData('cases');
    getWorldCoronaData();
    getCoronaNews();
}


var map;
var infoWindow;
let coronaGlobalData;
let mapCircles = [];
const worldwideSelection = {
    name: `<i class='world icon'></i> Worldwide`,
    value: 'ww',
    selected: true
}
var casesTypeColors = {
    cases: '#1d2c4d',
    recovered: '#7dd71d',
    deaths: '#CC1034'
}

const mapCenter = {
    lat: 34.80746,
    lng: -40.4796
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: mapCenter,
        // zoom: 3,
        minZoom: 2,
        styles: mapStyle

    });
    infoWindow = new google.maps.InfoWindow();
}



const changeDataSelection = (casesType) => {
    clearTheMap();
    showDataOnMap(coronaGlobalData, casesType);

    document.querySelector('.cases').classList.remove('active');
    document.querySelector('.recovered').classList.remove('active');
    document.querySelector('.deaths').classList.remove('active');

    document.querySelector('.' + casesType).classList.add('active');
    
    getHistoricalData(casesType);
}

const clearTheMap = () => {
    for(let circle of mapCircles){
        circle.setMap(null);
    }
}

const setMapCenter = (lat, long, zoom) => {
    map.setZoom(zoom);
    map.panTo({
        lat: lat, 
        lng: long
    });
}

const initDropdown = (searchList) => {
    $('.ui.dropdown').dropdown({
        values: searchList,
        onChange: function(value) {
            if(value!== worldwideSelection.value) {
                getCountryData(value);
            } else {
                getWorldCoronaData();
            }
        }
  });
}



const setSearchList = (data) => {
    data.sort((a, b) => a.country.localeCompare(b.country))
    let searchList = [];
    searchList.push(worldwideSelection);
    data.forEach ((countryData) => {
        let iconName;
        if (countryData.countryInfo.iso2) {
            iconName = countryData.countryInfo.iso2.toLowerCase();
        }
        
        console.log(iconName);
        searchList.push({
            name: `<i class='${iconName} flag'></i> ${countryData.country}`,
            value: countryData.countryInfo.iso2,
        })
    })

     initDropdown(searchList);
}



const getCountriesData = () => {
    fetch("https://disease.sh/v3/covid-19/countries")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        coronaGlobalData = data;
        showDataOnMap(data);
        showDataInTable(data);
        setSearchList(data);
    })
}

const getCountryData = (countryIso) => {
   // console.log(countryIso);
    const url = "https://disease.sh/v3/covid-19/countries/" + countryIso;
    fetch(url)
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        setMapCenter(data.countryInfo.lat, data.countryInfo.long, 3);
        setStatsData(data);
    })
}

const getWorldCoronaData = () => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        setMapCenter(mapCenter.lat, mapCenter.lng, 1);
        setStatsData(data);
    })
}

const setStatsData = (data) => {
    //console.log(data);
    let addedCases = numeral(data.todayCases).format('+0,0');
    let addedRecovered = numeral(data.todayRecovered).format('+0,0');
    let addedDeaths = numeral(data.todayDeaths).format('+0,0');
    let totalCases = numeral(data.cases).format('0.0a').toUpperCase();
    let totalRecovered = numeral(data.recovered).format('0.0a').toUpperCase();
    let totalDeaths = numeral(data.deaths).format('0.0a').toUpperCase();
    document.querySelector('.total-number').innerHTML = `${addedCases} <span class='sm-text'> Today</span>`;
    document.querySelector('.recovered-number').innerHTML = `${addedRecovered} <span class='sm-text'> Today</span>`;
    document.querySelector('.deaths-number').innerHTML = `${addedDeaths} <span class='sm-text'> Today</span>`;
    document.querySelector('.cases-total').innerHTML = `${totalCases} Total`;
    document.querySelector('.recovered-total').innerHTML = `${totalRecovered} Total`;
    document.querySelector('.deaths-total').innerHTML = `${totalDeaths} Total`;
    document.querySelector('#last-updated').innerHTML = `<em>Last Updated ${moment(data.updated).calendar()}</em>`;




    
}

const getHistoricalData = (casesType) => {
    fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=90")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        let chartData = buildChartData(data);
        buildChart(chartData, casesType);

    })
}

const openInfoWindow = () => {
    infoWindow.open(map);
}

const showDataOnMap = (data, casesType="cases") => {
    //console.log(data);

    data.map((country)=>{
        let countryCenter = {
            lat: country.countryInfo.lat,
            lng: country.countryInfo.long
        }

        var countryCircle = new google.maps.Circle({
            strokeColor: casesTypeColors[casesType],
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: casesTypeColors[casesType],
            fillOpacity: 0.35,
            map: map,
            center: countryCenter,
            radius: country[casesType]
        });

        mapCircles.push(countryCircle);

        var html = `
            <div class="info-container">
                <div class="info-flag" style="background-image: url(${country.countryInfo.flag});">
                </div>
                <div class="info-name">
                    ${country.country}
                </div>
                <div class="info-confirmed">
                    Total: ${numeral(country.cases).format(0,0)}
                </div>
                <div class="info-recovered">
                    Recovered: ${numeral(country.recovered).format(0,0)}
                </div>
                <div class="info-deaths">   
                    Deaths: ${numeral(country.deaths).format(0,0)}
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
        })

    })

}

const showDataInTable = (data) => {
    // console.log(data);
    data.sort(function(a, b) {
        return b.cases - a.cases;
    });
    var html = '';
    data.forEach((country)=>{
        html += `
        <tr onclick="updateDropdown('${country.countryInfo.iso2}')">
            <td><img class="table-flag" src="${country.countryInfo.flag}" /></td>
            <td>${country.country}</td>
            <td>${numeral(country.cases).format('0,0')}</td>
        </tr>
        `
    })
    document.getElementById('table-data').innerHTML = html;
}

const updateDropdown =  (countryIso) => {
    $('.ui.dropdown').dropdown('set selected',`${countryIso}`);
}


const getCoronaNews = () => {
    const apiKey = 'e393debf-51a4-4b9a-ad17-7f587d140e90';

    var url = 'https://content.guardianapis.com/search?' + 
          'q=covid%20corona&' +
          'page=1&' +
          '&show-fields=thumbnail,main&' +
          'api-key=' + apiKey;

    fetch(url)
    .then((response) => {
        return response.json()
    }).then((data) => {
       showNewsCards(data.response.results);
    })
}


const showNewsCards = (data) => {
    // console.log(data);
    let newsArticles = '';
    let indicators = '';
    let i=0;

    data.forEach((article)=>{
        let thumbnail = article.fields.thumbnail;
        let main = article.fields.main;
        let altTag= main.match(/alt="(.*?)"/g);
        let title = article.webTitle;
        let link = article.webUrl;

        newsArticles += `
            <div class="carousel-item">
                <a href="${link}" target="_blank">
                    <img src="${thumbnail}" class="d-block w-100" ${altTag}>
                </a>
                    <div class="carousel-caption d-none d-md-block bg-light text-dark">
                <p>${title}</p>
                </div>
            </div>
        `
        indicators += `
            <li data-target="#newsCarousel" data-slide-to="${i}"></li>
        `
        i++
    })

    document.getElementById('carousel-inner').innerHTML = newsArticles;
    document.getElementById('carousel-indicators').innerHTML = indicators;


    document.getElementById('carousel-inner').firstElementChild.classList.add('active');
    document.getElementById('carousel-indicators').firstElementChild.classList.add('active');
}