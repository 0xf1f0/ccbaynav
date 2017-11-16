/**
 * Import the weather icons from the json file and display the correct icon for current weather condition
 *
 * https://stackoverflow.com/questions/4828207/how-to-use-a-json-file-in-javascript
 * https://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
 */

$.getJSON("icon.json", function(data) {
    console.log(data);
    // data is a JavaScript object now. Handle it as such

});

/*
 * https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript


 The correct method - create a new XMLHttpRequest
    The clue here is the jQuery method $.getJSON() which is shorthand for $.ajax(). It may seem an odd approach requesting a
    local file in this way but it offers the most flexibility with minimum fuss.
*/
 function loadJSON(callback)
 {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'icon.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function ()
                            {
                                  if (xobj.readyState == 4 && xobj.status == "200")
                                  {
                                    // Required use of an anonymous callback as .open will NOT return a value but simply
                                    // returns undefined in asynchronous mode
                                    callback(xobj.responseText);
                                  }
                            };
    xobj.send(null);
 }
/*
The function above will create a new instance of a XMLHttpRequest and load asynchronously the contents of my_data.json.
I have gone with asynchronous but you can change the argument to false if you want a synchronous load. Thankfully all
modern browsers support the native JSON.parse method. Remember our anonymous callback? here's how you use it.
#Usage
*/
function init()
{
 loadJSON(function(response)
 {
  // Parse JSON string into object
    var actual_JSON = JSON.parse(response);
 });
}
