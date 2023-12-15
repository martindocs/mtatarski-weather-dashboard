$(document).ready(function() {

  $('#search-form').on('submit', function(e) {
    e.preventDefault();
    
    // Search input
    const searchInput = $('#search-input').val();
    
    // API key
    const apiKey = '61accb2975e7eb205d195492e4e98f62';

    // Query url    
    let queryUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + searchInput + '&appid=' + apiKey + '&units=metric';
 
    // fetch(baseUrl)
    // .then((response) => response.json())
    // .then((data) => {

    //   console.log(data);
    // })
    // .catch((error) =>{
    //   console.log(error);
    // })

  })

});