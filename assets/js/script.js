$(document).ready(function() {

  // Function to round up the temperatures to the nearest integer
  const roundUpNumber = (number) => {
    return Math.round(number * 100 / 100);
  }

  // Function to convert timestamp to milliseconds and then get the Date
  const getDate = (date) => {
    return new Date(date * 1000);
  }

  // Function to get the hours and minutes
  const sunSetSunRise = (time) => {
    const date = new Date(time * 1000);

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
  }

  // Function to populate the Boostrap card with data from the Weather API
  const card = (...args) => {
    const{
      cardType,
      city, 
      icon, 
      desc,
      date, 
      temp, 
      hiTemp, 
      lowTemp,
      feelsLike,
      humid,
      wind,
      sunrise,
      sunset,
      pressure,
      visible,
      population,
    } = args[0];

    if(city) cardType.city.text(city);
    if(icon) {
      cardType.icon.attr('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
      cardType.icon.attr('alt', desc);
    }
    if(desc) cardType.desc.text(desc);
    if(date) cardType.date.text(date.split(' ')[0]);
    if(temp) cardType.temp.text(temp + '\u00B0C');
    if(hiTemp) cardType.hiTemp.text(`Hi ${hiTemp}`);
    if(lowTemp) cardType.lowTemp.text(`Lo ${lowTemp}`);
    if(feelsLike) cardType.feelsLike.text(`Feels like: ${feelsLike} \u00B0C`);
    if(humid) cardType.humid.text(`Humidity: ${humid} %`);
    if(wind) cardType.wind.text(`Wind: ${wind} km/h`);
    if(sunrise) cardType.sunrise.text(`Sunrise: ${sunrise}`);
    if(sunset) cardType.sunset.text(`Sunset: ${sunset}`);
    if(pressure) cardType.pressure.text(`Presure: ${pressure} hPa`);
    if(visible) cardType.visible.text(`Visibility: ${visible} km`);
    if(population) cardType.population.text(`Population: ${population} people`);
  }
  
  // Event listener for search results
  $('#search-form').on('submit', function(e) {
    e.preventDefault();
    
    // Elements for the main card
    const mainCard = {
      city: $('#search-city'), 
      icon: $('#main-icon'),
      desc: $('#main-desc'),
      date: $('#main-date'),
      temp: $('#main-temp'),
      hiTemp: $('#main-temp-hi'),
      lowTemp: $('#main-temp-low'),
      feelsLike: $('#main-feels'),
      humid: $('#main-humid'),
      wind: $('#main-wind'),
      sunrise: $('#main-sunrise'),
      sunset: $('#main-sunset'),
      pressure: $('#main-pressure'),
      visible: $('#main-visible'),
      population: $('#main-population'),
    };

    // Search input
    const searchInput = $('#search-input').val();
    
    // API key
    const apiKey = '61accb2975e7eb205d195492e4e98f62';

    // Query url    
    let queryUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + searchInput + '&appid=' + apiKey + '&units=metric';
 
    // Fetch the weather data form Weather API
    fetch(queryUrl)
    .then((response) => response.json())
    .then((data) => {
      
      const city = data.city;      
      const filterData = []; // one card per day 

      // Filter the weather data and grap only data at 12pm for each day
      data.list.forEach(function(time) {  
        const dateTime = getDate(time.dt);       
        if(dateTime.getHours() === 12){
          filterData.push(time);
        }
      });

      // Destructure the data from the API
      const{weather, dt_txt:wdate, main, wind, visibility} = filterData[0];

      // console.log(weather, wdate, main, wind);
      // console.log(main, visibility)

      // Fill the data for the main card
      card({
        cardType: mainCard,
        city: city.name,
        icon: weather[0].icon,
        desc: weather[0].description,
        date: wdate,
        temp: roundUpNumber(main.temp),
        hiTemp: roundUpNumber(main.temp_max),
        lowTemp: roundUpNumber(main.temp_min),
        feelsLike: roundUpNumber(main.feels_like),
        humid: main.humidity,
        wind: roundUpNumber(wind.speed),
        sunrise: sunSetSunRise(city.sunrise),
        sunset: sunSetSunRise(city.sunset),
        pressure: main.pressure,
        visible: visibility,
        population: city.population.toLocaleString(),
      })


    })
    .catch((error) =>{
      console.log(error);
    })

  })

});