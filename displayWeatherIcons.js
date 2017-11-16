/**
 * Import the weather icons from the json file and display the correct icon for current weather condition
 * https://www.youtube.com/watch?v=gwTkd52Dm48 "How to Get JSON data to HTML page" by: Help People
 * https://www.youtube.com/watch?v=6mT3r8Qn1VY "Loading JSON data from a URL (Asynchronous Callbacks!)" by: The Coding Train
 * https://www.youtube.com/watch?v=ecT42O6I_WI "Working with APIs in Javascript" by: The Coding Train
 */

 /*
    - Preload the json file containing the icons
    - Read in weather json for the area we want via URL
    - Grab the icon tag associated with the current weather in the area from the
      weather json we got via URL
    - If the icon exists...
        - Use switch case to call the correct iconImg from the icon.json file
        - Once called the icon will be displayed onscreen
 */
 function preload()
 {
    iconImg = loadJSON("icon.json");
 }
 function setup()
 {
    loadJSON("URL FOR OUR JSON WEATHER INFO GOES HERE",gotData);
    //if error occurs try...
    //loadJSON(icon.json,gotData,'jsonp');
 }

 function gotData(data)
 {
    var icon = data.icon;
    if(icon)
    {
        switch(icon)
        {
            case 01d:
                output.innerHTML = iconImg.01d;
                break;
            case 01n:
                output.innerHTML = iconImg.01n;
                break;
            case 02d:
                output.innerHTML = iconImg.02d;
                break;
            case 02n:
                output.innerHTML = iconImg.02n;
                break;
            case 03d:
                output.innerHTML = iconImg.03d;
                break;
            case 03n:
                output.innerHTML = iconImg.03n;
                break;
            case 04d:
                output.innerHTML = iconImg.04d;
                break;
            case 04n:
                output.innerHTML = iconImg.04n;
                break;
            case 09d:
                output.innerHTML = iconImg.09d;
                break;
            case 09n:
                output.innerHTML = iconImg.09n;
                break;
            case 10d:
                output.innerHTML = iconImg.10d;
                break;
            case 10n:
                output.innerHTML = iconImg.10n;
                break;
            case 11d:
                output.innerHTML = iconImg.11d;
                break;
            case 11n:
                output.innerHTML = iconImg.11n;
                break;
            case 13d:
                output.innerHTML = iconImg.13d;
                break;
            case 13n:
                output.innerHTML = iconImg.13n;
                break;
            case 50d:
                output.innerHTML = iconImg.50d;
                break;
            case 50n:
                output.innerHTML = iconImg.50n;
                break;
        }
    }
 }