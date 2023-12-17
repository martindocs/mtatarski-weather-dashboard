$(document).ready(function() {

  // Function to get data from the localStorage
  const getLocalStorage = () => {
    const storage = JSON.parse(localStorage.getItem('locations'));
    if(!storage){
      localStorage.setItem('locations', JSON.stringify([]));
    }
    return storage === null ? [] : storage;
  }

  // Function to set data in the localStorage
  const setLocalStorage = (search) => {
    if(search){
      const getStorage = getLocalStorage();            
      getStorage.push(search.toLowerCase());
      return localStorage.setItem('locations', JSON.stringify(getStorage));
    }
  }
  
  // Function to create buttons
  const newButton = (search) => {
    const historyList = $('.accordion-body');
    
    // Remove existing 'No History' element if it exists
    $('#no-history').remove();

    // Create buttons in the container history
    if(Array.isArray(search) && search.length > 0){
      search.forEach(function (item) {
        const button = createButton(item);      
        historyList.prepend(button);
      });
    }else{
      // Create new button when user clicks/enter new location
      if(search.length === 0){                      
        const p =  $('<p>').attr('id', 'no-history').text('No History');
        historyList.prepend(p);
      }else{
        const button = createButton(search);       
        historyList.prepend(button);
      }
    }
  }

  // Helper function to create a button element
  const createButton = (text) => {
    return $('<button>').addClass('btn btn-outline-secondary locations').attr('data-location', text).text(text);
  }

  // Get the data from the localStorage on initialization
  const searchHistory = getLocalStorage();

  // Display the search history
  if(searchHistory !== null || searchHistory.length > 0){    
    newButton(searchHistory);    
  }

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
  
  // Function to fetch weather data
  const fetchData = async (searchInput) => {

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
   
    // API key
    const apiKey = '61accb2975e7eb205d195492e4e98f62';

    // Bulding query parameters
    const queryUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + searchInput + '&appid=' + apiKey + '&units=metric';

    try{
      const response = await fetch(queryUrl);

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const city = data.city;
      const filterData = data.list.filter(time => getDate(time.dt).getHours() === 12);

      const { weather, dt_txt: wdate, main, wind, visibility } = filterData[0];

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
      });
     
      const cardsContainer = $('#forecast .row');  
      cardsContainer.empty();

      for(let i = 0; i < filterData.length; i++) {
        const col1 = $('<div>').addClass('col');
        const card = $('<div>').addClass('card');
        const date = $('<div>').addClass('card-header weather-date').attr('id', `date-${i}`);
        const cardBody = $('<div>').addClass('card-body');
        const row1 = $('<div>').addClass('row');
        const icon = $('<span>').addClass('weather-icon').attr('id', `icon-${i}`);
        const row2 = $('<div>').addClass('row');
        const col2 = $('<div>').addClass('col');
        const temp = $('<div>').addClass('weather-temp').attr('id', `temp-${i}`);
        const winds = $('<div>').addClass('weather-wind').attr('id', `wind-${i}`);
        const humid = $('<div>').addClass('weather-humid').attr('id', `humid-${i}`);

        col2.append(temp, winds, humid);
        row2.append(col2);
        row1.append(icon);
        cardBody.append(row1, row2);
        card.append(date, cardBody);
        col1.append(card);
        cardsContainer.append(col1);  
      };

      const forecastCards = (index) => {
        return {
          date: $(`#date-${index}`),
          icon: $(`#icon-${index}`),
          temp: $(`#temp-${index}`),
          wind: $(`#wind-${index}`),
          humid: $(`#humid-${index}`),
        }
      }  

      filterData.forEach(function(data, index) {
        const { weather, dt_txt: wdate, main, wind} = data;
        
          card({
          cardType: forecastCards(index),
          icon: weather[0].icon,
          date: wdate,
          temp: roundUpNumber(main.temp),
          wind: roundUpNumber(wind.speed),
          humid: main.humidity,
        })

      })

      return true;

    }catch(error){
      return false;
    }    
  };

  // Event listener for search results
  $('#search-form').on('submit', function(e) {
    e.preventDefault();
    
    // Search input
    const searchInput = $('#search-input').val();
  
    fetchData(searchInput).then((data) => {
      if(data){
        getLocalStorage();
    
        const history = getLocalStorage();    
                
        if(!history.includes(searchInput)) {
          newButton(searchInput.toLowerCase());      
          setLocalStorage(searchInput)
        };
      }
    })

  });

  // Event listeners for history buttons
  $('#accordion-body').on('click', '.locations', function() {

    const location = $(this).attr('data-location');    
    fetchData(location);
    
  })
});