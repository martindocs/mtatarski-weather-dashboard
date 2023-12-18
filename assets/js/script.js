
$(document).ready(function() { 
  // Add this variable to keep track of whether the animation has occurred
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
    // Hide the cards-container initially
    $('#cards-container').hide();
    $('#search-animation').addClass('justify-content-center');
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

  const calcTime = () => {
    const currentDate = new Date();    
    return `${currentDate.getHours()}:${currentDate.getMinutes()}`
  }
  
  const feedbackMsg = (str, color) => {    
    const msg = $('#feedback-msg').text(str).css('color', color);  
    setTimeout(() => {
      msg.text('');
    }, 2000);    
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
  
  // Function to fetch weather data
  const fetchData = async (searchInput) => {

    // Elements for the main card
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

    // Bulding query parameters
    const queryUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + searchInput + '&appid=' + apiKey + '&units=metric';

    try{
      const response = await fetch(queryUrl);

      if (!response.ok) {       
        return false;
      }

      const data = await response.json();
      console.log(data)

      const city = data.city;
      // const filterData = [];
      // let currentWeather = null;
      const currentDate = new Date(); // Get the current date    

      // data.list.forEach((time) => {
      //   // Convert timestamp to date
      //   const entryDate = getDate(time.dt);
       
      //   // If the entry is for the current day and currentWeather is not assigned yet
      //   if((entryDate.getDate() === currentDate.getDate() || entryDate.getDate() === currentDate.getDate() + 1) && currentWeather === null) {
      //     currentWeather = time;
      //   }

      //   // If the entry is at 12 PM and not for the current day, include it in forecastData
      //   if (entryDate.getHours() === 12 && entryDate.getDate() !== currentDate.getDate()) {
      //     filterData.push(time);
      //   }           
      // });


      // const currentWeather = data.list.reduce((closest, entry) => {
      //   const entryDate = new Date(entry.dt * 1000);
      
      //   if (
      //     entryDate.getDate() === currentDate.getDate() &&
      //     Math.abs(entryDate.getHours() - currentDate.getHours()) < Math.abs(closest.dt - currentDate.getTime())
      //   ) {
      //     return entry;
      //   }
      
      //   return closest;
      // }, data.list[0]);

      // let currentWeather = data.list[0]; // Initialize with the first entry

      // for (const entry of data.list) {
      //   const entryDate = new Date(entry.dt * 1000);        
      //   // the time difference in milliseconds between the two dates.
      //   const timeDifference = Math.abs(entryDate - currentDate);

      //   if (entryDate.getDate() === currentDate.getDate() && timeDifference < Math.abs(currentWeather.dt - currentDate)) {
      //     currentWeather = entry;
      //   }
      // }

      let currentWeather = data.list[0]; // Initialize with the first entry

      for (const entry of data.list) {
        const entryDate = new Date(entry.dt * 1000);

        if (
          entryDate.getDate() === currentDate.getDate() &&
          // the time difference in milliseconds between the two dates.
          Math.abs(entryDate - currentDate) < Math.abs(currentWeather.dt - currentDate)
        ) {
          currentWeather = entry;
        }
      }
      
     
      const filterData = [];
      const includedDays = [];

      data.list.forEach(entry => {
        const entryDate = new Date(entry.dt * 1000);
        const entryDay = entryDate.getDate();

        if (entryDay !== currentDate.getDate() && !includedDays.includes(entryDay)) {
          filterData.push(entry);
          includedDays.push(entryDay);
        }
      });
      
      // console.log(currentWeather)
      // console.log(filterData)


      // const { weather, dt_txt: wdate, main, wind, visibility } = filterData[0];
      const { weather, dt_txt: wdate, main, wind, visibility } = currentWeather;

      // Populate the data for the main card
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
      cardsContainer.empty();

      // Create the forecast cards HTML elements
      for(let i = 0; i < filterData.length; i++) {
        const col1 = $('<div>').addClass('col col-sm-4 col-md-3 my-2');
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

      const forecastCards = (index) => {
        return {
          date: $(`#date-${index}`),
          icon: $(`#icon-${index}`),
          temp: $(`#temp-${index}`),
          wind: $(`#wind-${index}`),
          humid: $(`#humid-${index}`),
        }
      }    
      
      // Populate the forecast cards
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
      });

      return true;

    }catch(error){
      console.log(error)
      return false;
    }    
  };

  // Event listener for search results
  $('#search-form').on('submit', function(e) {
    e.preventDefault();
    // Search input
    const searchInput = $('#search-input').val();    

    if(searchInput){      
      fetchData(searchInput).then((data) => {
      
        if(data){        
          
          getLocalStorage();
          
          const history = getLocalStorage();    
          
          if(!history.includes(searchInput)) {
            newButton(searchInput.toLowerCase());      
            setLocalStorage(searchInput);
          };

          // Show the cards-container with a fade-in effect
          $('#cards-container').fadeIn(1000, function () {   
            $('#search-animation').removeClass('justify-content-center');
          });
          
          // Animation complete, set the flag to true
          animationOccurred = true;

        }else{      
          feedbackMsg("No city found", 'red');
          return;
        }
      });     

      $('#cards-container').fadeIn(1000, function () {   
        $('#search-animation').removeClass('justify-content-center');
      });
      
      // Animation complete, set the flag to true
      animationOccurred = true;

    }else{
      feedbackMsg("Please enter city name", 'red');
    }

  });


  $('#button-search').on('click', function(){

    const location = $(this).prev().val();
    
    if(location){      
      fetchData(location).then((data) => {
      
        if(data){        
          
          getLocalStorage();
          
          const history = getLocalStorage();    
          
          if(!history.includes(location)) {
            newButton(location.toLowerCase());      
            setLocalStorage(location);
          };

          // Show the cards-container with a fade-in effect
          $('#cards-container').fadeIn(1000, function () {   
            $('#search-animation').removeClass('justify-content-center');
          });
          
          // Animation complete, set the flag to true
          animationOccurred = true;

        }else{      
          feedbackMsg("No city found", 'red');         
        }
      });     

      $('#cards-container').fadeIn(1000, function () {   
        $('#search-animation').removeClass('justify-content-center');
      });
      
      // Animation complete, set the flag to true
      animationOccurred = true;

    }else{
      feedbackMsg("Please enter city name", 'red');
    }
    
  });

  // Event listeners for history buttons
  $('#accordion-body').on('click', '.locations', function() {

    const location = $(this).attr('data-location'); 
    
    fetchData(location);
    
    // Show the cards-container with a fade-in effect
    $('#cards-container').fadeIn(1000, function () {   
      $('#search-animation').removeClass('justify-content-center');
    });

    // Animation complete, set the flag to true
    animationOccurred = true;
    
  });

});