$(document).ready(function() { 
  // variable to keep track of whether the animation has occurred
  let animationOccurred = false;

  // Function to get data from the localStorage
  const getLocalStorage = () => {
    const storage = JSON.parse(localStorage.getItem('locations'));
    if(!storage){
      localStorage.setItem('locations', JSON.stringify([]));
    }
    return storage === null ? [] : storage;
  }
  
  // Check if the animation has occurred
  if (!animationOccurred) {
    // Hide the #cards-container and move search input to center
    // Only occurs on initially page load or page refresh
    $('#cards-container').hide();
    $('#search-animation').addClass('justify-content-center');
  }

  // Function to set/save data in the localStorage
  const setLocalStorage = (search) => {
    if(search){
      const getStorage = getLocalStorage();            
      getStorage.push(search.toLowerCase());
      return localStorage.setItem('locations', JSON.stringify(getStorage));
    }
  }
  
  // Function to create buttons in history list
  const newButton = (search) => {
    const historyList = $('.accordion-body');
    
    // Remove existing 'No History' element if it exists
    $('#no-history').remove();

    // Generate buttons in the container history
    if(Array.isArray(search) && search.length > 0){
      search.forEach(function (item) {
        const button = createButton(item);      
        historyList.prepend(button);
      });
    }else{
      // Create new button on user clicks/enter new location
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

  // Display the search history as buttons
  if(searchHistory !== null || searchHistory.length > 0){    
    newButton(searchHistory);    
  }

  // Function to round up the temperatures to the nearest integer
  const roundUpNumber = (number) => {
    return Math.round(number * 100 / 100);
  }

  // Function to get current time
  const calcTime = () => {
    const currentDate = new Date();    
    return `${currentDate.getHours()}:${currentDate.getMinutes()}`
  }
  
  // Function to display feedback message to the user
  const feedbackMsg = (str, color) => {    
    const msg = $('#feedback-msg').text(str).css('color', color);  
    setTimeout(() => {
      msg.text('');
    }, 2000);    
  }

  // Function to get the hours and minutes
  const sunSetSunRise = (time) => {
    // convert timestamp to milliseconds and then get the Date
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
      time,
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
    if(time) cardType.time.text(calcTime);
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
  
  // Function fetch the Weather data
  const fetchData = async (searchInput) => {

    // The main card
    const mainCard = {
      city: $('#search-city'), 
      icon: $('#main-icon'),
      desc: $('#main-desc'),
      date: $('#main-date'),
      time: $('#main-time'),
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

    // Query parameters
    const queryUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + searchInput + '&appid=' + apiKey + '&units=metric';

    try{
      const response = await fetch(queryUrl);

      if (!response.ok) {       
        return false;
      }

      const data = await response.json();
      
      const city = data.city;      
      const currentDate = new Date(); // Get the current date    

      let currentWeather = data.list[0]; // Initialize with the first entry

      // Get current weather information
      for (const entry of data.list) {
        // convert timestamp to milliseconds and then get the Date
        const entryDate = new Date(entry.dt * 1000);

        if (
          entryDate.getDate() === currentDate.getDate() &&
          // the time difference in milliseconds between the two dates.
          Math.abs(entryDate - currentDate) < Math.abs(currentWeather.dt - currentDate)
        ) {
          currentWeather = entry;
        }
      }
           
      // Get forecast weather data 
      const filterData = [];
      const includedDays = [];
      data.list.forEach(entry => {
        // convert timestamp to milliseconds and then get the Date
        const entryDate = new Date(entry.dt * 1000);
        const entryDay = entryDate.getDate();

        if (entryDay !== currentDate.getDate() && !includedDays.includes(entryDay)) {
          filterData.push(entry);
          includedDays.push(entryDay);
        }
      });
      
      // Destructuring the fetched data
      const { weather, dt_txt: wdate, main, wind, visibility } = currentWeather;

      // Populate data for the main card
      card({
        cardType: mainCard,
        city: city.name,
        icon: weather[0].icon,
        desc: weather[0].description,
        date: wdate,
        time: wdate,
        temp: roundUpNumber(main.temp),
        hiTemp: roundUpNumber(main.temp_max),
        lowTemp: roundUpNumber(main.temp_min),
        feelsLike: roundUpNumber(main.feels_like),
        humid: main.humidity,
        wind: roundUpNumber(wind.speed),
        sunrise: sunSetSunRise(city.sunrise),
        sunset: sunSetSunRise(city.sunset),
        pressure: main.pressure,
        visible: visibility.toLocaleString(),
        population: city.population.toLocaleString(),
      });
     
      const cardsContainer = $('#forecast .row');  
      cardsContainer.empty(); // clear the container before rendering the forecast

      // Generate five days forecast cards elements
      for(let i = 0; i < filterData.length; i++) {
        const col1 = $('<div>').addClass('col col-sm-4 col-md-2 my-2');
        const card = $('<div>').addClass('card text-center');
        const date = $('<div>').addClass('card-header forecast-date').attr('id', `date-${i}`);
        const cardBody = $('<div>').addClass('card-body forecast-icon-pos');
        const row1 = $('<div>').addClass('row ');
        const icon = $('<img>').addClass('forecast-icon').attr('src', weather[0].icon).attr('alt', `forecast icon ${weather[0].description}`).attr('id', `icon-${i}`);       
        const temp = $('<div>').addClass('forecast-temp').attr('id', `temp-${i}`);
        const row2 = $('<div>').addClass('row');
        const col2 = $('<div>').addClass('col');
        const winds = $('<div>').addClass('forecast-wind').attr('id', `wind-${i}`);
        const humid = $('<div>').addClass('forecast-humid').attr('id', `humid-${i}`);

        col2.append(winds, humid);
        row2.append(col2);
        row1.append(icon, temp);
        cardBody.append(row1, row2);
        card.append(date, cardBody);
        col1.append(card);
        cardsContainer.append(col1);  
      };

      // Forecast card
      const forecastCards = (index) => {
        return {
          date: $(`#date-${index}`),
          icon: $(`#icon-${index}`),
          temp: $(`#temp-${index}`),
          wind: $(`#wind-${index}`),
          humid: $(`#humid-${index}`),
        }
      }    
      
      // Populate forecast cards with weather data
      filterData.forEach(function(data, index) {
        // Destructure weather data
        const { weather, dt_txt: wdate, main, wind} = data;        
          card({
          cardType: forecastCards(index),
          icon: weather[0].icon,
          date: wdate,
          temp: roundUpNumber(main.temp),
          wind: roundUpNumber(wind.speed),
          humid: main.humidity,
        })
      });

      return true; // if current weather and five days forecast

    }catch(error){
      console.log(error);
      return false; // if city not found or weather not found
    }    
  };


  // Event listener for submit results
  $('#search-form').on('submit', function(e) {
    e.preventDefault();
    // Search input
    const searchInput = $('#search-input').val();    
    
    // If entry is not empty
    if(searchInput){      
      fetchData(searchInput).then((data) => {      
        if(data){        
          
          // Get the localStorage before saving new search
          getLocalStorage();
          
          const history = getLocalStorage();    
          
          // Save the search entry only if is not existing in localStorage
          // and create new button for history list
          if(!history.includes(searchInput)) {
            newButton(searchInput.toLowerCase());      
            setLocalStorage(searchInput);
          };

          // Clear the search input
          $('#search-input').val('');

          // Show the cards-container with a fade-in effect
          $('#cards-container').fadeIn(1000, function () {   
            $('#search-animation').removeClass('justify-content-center');
          });
          
          // Animation complete, set the flag to true
          animationOccurred = true;

        }else{      
          // Otherwise show error message
          feedbackMsg("No city found", 'red');
          return;
        }
      });     

    }else{
      // If fetch data was unsuccessful with 404 code, no city found
      feedbackMsg("Please enter city name", 'red');
    }
  });


  // Event listener for search button click
  $('#button-search').on('click', function(){
    // Get search input text
    const location = $(this).prev().val();
    
    // If the search input is not empty
    if(location){      
      fetchData(location).then((data) => {
      
        if(data){        
          
          // Get the localStorage before saving new search
          getLocalStorage();
          
          const history = getLocalStorage();    
          
          // Save the search entry only if is not existing in localStorage
          // and create new button for history list
          if(!history.includes(location)) {
            newButton(location.toLowerCase());      
            setLocalStorage(location);
          };

          // Clear the search input
          $(this).prev().val('');

          // Show the cards-container with a fade-in effect
          $('#cards-container').fadeIn(1000, function () {   
            $('#search-animation').removeClass('justify-content-center');
          });
          
          // Animation complete, set the flag to true
          animationOccurred = true;

        }else{     
          // Otherwise show error message 
          feedbackMsg("No city found", 'red');         
        }
      });       

    }else{
      // If fetch data was unsuccessful with 404 code, no city found
      feedbackMsg("Please enter city name", 'red');
    }
    
  });


  // Event listeners for history list buttons
  $('#accordion-body').on('click', '.locations', function() {
    // Get search input text
    const location = $(this).attr('data-location'); 
    
    // fetch data from Weather API
    fetchData(location);
    
    // Show the cards-container with a fade-in effect
    $('#cards-container').fadeIn(1000, function () {   
      $('#search-animation').removeClass('justify-content-center');
    });

    // Animation complete, set the flag to true
    animationOccurred = true;    
  });
});