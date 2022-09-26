var arkansasCoords = [34.5574, -92.2863];
var mapZoomLevel = 4;

function createMap(earthquake)
{
  // Create the tile layer that will be the background of our map.
  // Create tile layer
  var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 4,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the streetmap layer.
  var baseMaps = {
    "Grayscale Map": grayscaleMap
  };
  // Create an overlayMaps object to hold the earthquake layer.
  var overlayMaps = {
    "Earthquakes": earthquake
  };
  // Create the map object with options.
  var map = L.map("map", {
    center: arkansasCoords,
    zoom: mapZoomLevel,
    layers: [grayscaleMap, earthquake]
  });
  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  var legendColors = [
    "green",
    "yellow",
    "orange",
    "orangered",
    "red",
    "maroon"
  ];
    
  // Create a legend to display information about our map
  var legend = L.control({
    position: "bottomright",
    backgroundColor: 'white',
    
  });
  
  // When the layer control is added, insert a div with the class of "legend"
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    var depth = [9, 29, 49, 69, 89, 500];
    var labels = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
    div.innerHTML = '<div>Depth (km)</div>';
    for (var i = 0; i < depth.length; i++){
      div.innerHTML += '<i style="background:' + legendColors[i] + '">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;'+
                      labels[i] + '<br>';
    }
    return div;
  };
  // Add the legend to the map
  legend.addTo(map);
}
// Create the createMarkers function.
function createMarkers(response)
{
  console.log(response);
  // Pull the "mag" property from response.features.
  // creates an array of eathquakes that we can use to get the data that we need
  var earthquakesData = response.features;
  // Initialize an array to hold the earthquakes.
  var earthquakeMarkers = [];

  // Loop through the stations array.
  for(var i = 0; i < earthquakesData.length; i++)
  {
    //console.log(earthquakesData[i]);
    // For each earthquake, create a marker, and bind a popup with the title and time.
    
    // change the marker size based on depth
    var markerRadius = earthquakesData[i].properties.mag * 25000;
    var markerColor;
    var depth = earthquakesData[i].geometry.coordinates[2]
    if(depth < 10)
      markerColor = "green";
    else if(depth < 30)
      markerColor = "yellow";
    else if(depth < 50)
      markerColor = "orange";
    else if(depth < 70)
      markerColor = "orangered";
    else if(depth < 90)
      markerColor = "red";
    else markerColor = "maroon";

    var earthquake = L.circle([earthquakesData[i].geometry.coordinates[1], earthquakesData[i].geometry.coordinates[0]], {
        fillOpacity: .30,
        color: "white",
        fillColor: markerColor,
        radius: markerRadius,
        weight: 1
    })
    .bindPopup("<h3>" + earthquakesData[i].properties.title +
    "</h3><hr><p>" + new Date(earthquakesData[i].properties.time) + "</p>");
    // Add the marker to the earthquakeMarkers array.
    earthquakeMarkers.push(earthquake);
    
  }
  console.log(earthquakeMarkers);

  var earthquake = L.layerGroup(earthquakeMarkers); 
  createMap(earthquake);
  
}

// Perform an API call to the earthquake API to get the earthquake information. Call createMarkers when it completes.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
  createMarkers
);