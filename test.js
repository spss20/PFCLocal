const destinationLocation = {"lat" : "28.485275" , "lon" : "77.019353"}

const currentLocation = {"lat" : "28.484794" , "lon" : "77.020066"}

let spotCoordinates1 = [28.484794, 77.020066];
let spotCoordinates2 = [28.4855622, 77.0192079]

let center = {lat: 28.485275, lng: 77.019353};
let radius = 0.1

checkIfInside(spotCoordinates1);
checkIfInside(spotCoordinates2);

function checkIfInside(spotCoordinates) {

    let newRadius = distanceInKmBetweenEarthCoordinates(spotCoordinates[0], spotCoordinates[1], center.lat, center.lng);
    console.log(newRadius)

    if( newRadius < radius ) {
        //point is inside the circle
        console.log('inside')
    }
    else if(newRadius > radius) {
        //point is outside the circle
        console.log('outside')
    }
    else {
        //point is on the circle
        console.log('on the circle')
    }

}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return earthRadiusKm * c;
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}