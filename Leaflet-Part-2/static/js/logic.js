var ItalyCoords = [41.8719, 12.5674];
var mapZoomLevel = 2;
var tectonicplatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

function createMap(earthquake, tectonicplate)
{
  console.log("Plates Data:", tectonicplate); 
  // Create the tile layer that will be the background of our map.
  // Create tile layer

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 5,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
  });

  var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 5,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 5,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
  });

  // Create a baseMaps object to hold the streetmap layer.
  var baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
  };
  
  // Create an overlayMaps object to hold the earthquake layer.
  var overlayMaps = {
    "Earthquakes": earthquake,
    "Tectonic Plates": tectonicplate
  };

  // Create the map object with options.
  var map = L.map("map", {
    center: ItalyCoords,
    zoom: mapZoomLevel,
    layers: [satellite,earthquake,tectonicplate]
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
    position: "bottomright"
       
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
    // For each earthquake, create a marker, and bind a popup with place, mag and depth.
    
    // change the marker size based on magnitude and depth by color
    var markerRadius = earthquakesData[i].properties.mag * 30000;
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
    .bindPopup("<h3>" + "<p>" + "Magnitude: "
    + earthquakesData[i].properties.mag
    + "<br>Depth: "
    + earthquakesData[i].geometry.coordinates[2]
    + "<br>Location: "
    + earthquakesData[i].properties.place + "</h3></p>");
    // Add the marker to the earthquakeMarkers array.
    earthquakeMarkers.push(earthquake);
    
  }
  console.log("earthquake Markers:",earthquakeMarkers);

  // Create layerGroup for earthquakeMarkers
  let earthquakes = L.layerGroup(earthquakeMarkers);
  var tectonicplates = new L.LayerGroup();

  // Adding our geoJSON data, along with style information, to the tectonicplates
  // layer.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(platedata) {
    
    L.geoJson(platedata, {
      color: "blue",
      weight: 2
    })
    .addTo(tectonicplates);

    createMap(earthquakes, tectonicplates)
  
  });
 
};

// Perform an API call to the earthquake API to get the earthquake information. Call createMarkers when it completes.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
  
  createMarkers
);
