const fs = require('fs')

const body = {"id":14,"startDate":"2021-03-31T15:55:37.330Z","finishDate":null,"jerrycansQuantity":null,"jerrycansQuantityAtFinish":null,"missingJerrycans":null,"totalEmptiedJerrycans":null,"totalLoadedJerrycansLeft":null,"truckId":null,"driver":{"id":1,"username":"suryapss","email":"sppro.20@gmail.com","provider":"local","confirmed":true,"blocked":false,"role":1,"trip":14,"created_at":"2021-03-31T14:03:24.302Z","updated_at":"2021-03-31T15:55:37.383Z"},"published_at":"2021-03-31T15:55:37.353Z","created_at":"2021-03-31T15:55:37.359Z","updated_at":"2021-03-31T15:55:37.401Z","jerrycans":[],"logs":[]}

console.log("Id: " , body.id);
function setTripId(trip_id){
    const rawFile = fs.readFileSync("configurations");
    const data = JSON.parse(rawFile);
    data.trip_id = trip_id;
  
    fs.writeFileSync("configurations", JSON.stringify(data))
    tripId = trip_id;
  }