const express = require('express');
const fs = require('fs')
const db = require('./database');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const constants = require('./constants');
const request = require('request');
const utils = require('./utils')
var format = require('date-format');
var websocket = null;
var tripStatus;
//0 = trip is not initialised yet by driver, 
//1= trip started but base reading yet to be taken by next reading from readerB
//2 = trip has started as well as we have base reading
var tripId;
loadConfigurations();

var currentCansList;
var missingCansList = [];
app.use(express.static('public'))
app.use(express.json());

server.listen(3000, function () {
  console.log("Server listening on port 3000")
});


// This api call will decide the base cans in truck
app.post('/start_trip', function (req, res) {

  if (tripStatus == 0) {
    setTripStatus(1);
    missingCansList = [];
    currentCansList = [];
    console.log("Trip Started");
    res.send('Trip started successfully')

    const url = constants.baseUrl + "trips"
    const data = {
      "startDate": format.asString(),
      "driver": [1]
    }
    request.post(url, { form: data }, (error, httpResponse, body) => {
      if (error) {
        console.log(error);
      } else {
        const response = JSON.parse(body);
        setTripId(response.id);
      }
    })

  } else {
    console.log("A trip is already in progress")
    res.send("Err: A trip is already in progress")
  }

})

app.post('/stop_trip', function (req, res) {
  if (tripStatus != 0) {

    const jerrycansList = [];
    var emptiedJerryCans = 0;
    var filledJerryCans = 0;
    const query = "SELECT * FROM cans"

    db.query(query, (err, result) => {

      result.forEach(jerrycan => {
        if (jerrycan.isEmptied == 1)
          emptiedJerryCans += 1;
        else filledJerryCans += 1;
        jerrycansList.push({ "rfId": jerrycan.rfId, "isEmptied": jerrycan.isEmptied })
      })

      //Temporary Bugfix
      if(currentCansList == null){
        currentCansList = [];
      }
      const data = {
        "finishDate": format.asString(),
        "jerrycansQuantityAtFinish": currentCansList.length,
        "missingJerrycans": missingCansList.length,
        "totalEmptiedJerrycans": emptiedJerryCans,
        "totalFilledJerrycansLeft": filledJerryCans,
        "jerrycans": jerrycansList
      };
      //Updating trip final data to server
      const stopTripUrl = constants.baseUrl + "trips/" + tripId;

      request({
        method: "PUT",
        uri: stopTripUrl,
        json: data
      }, function (err, response, body) {
        setTripStatus(0);
        console.log("Trip Stopped")
      });

    })
    res.send("Trip stopped successfully")

  } else {
    res.send("No trip is running that can be stoppped.")
  }
})

app.get('/get_trip_status', function (req, res) {
  res.send({
    "code": 200,
    "trip_status": tripStatus
  })
})

io.on('connection', socket => {
  console.log("Client Connected")
  websocket = socket;

  //Reader A used to empty a perrycan with specific rfId
  socket.on("readerA", data => {
    if (tripStatus == 0) {
      return
    }
    const buf = Buffer.from(data.replace(/\s/g, ""), "hex");
    const serial = new Uint32Array(buf);
    if (serial[0] === 10 &&
      serial[1] === 13) {
      const a = serial[2];
      const b = serial[3];
      const rfId = (a << 8) | b;

      const query = `UPDATE cans SET isEmptied = 1 WHERE rfId = '${rfId}'`
      db.query(query, function (err, result) {
        if (err) return;
        console.log(`Can with rfId ${rfId} emptied successfully`)
      })
    }
  })

  socket.on("readerB", data => {
    if (tripStatus == 0) {
      return
    }
    const buf = Buffer.from(data.replace(/\s/g, ""), "hex");
    const serial = new Uint32Array(buf);
    if (serial[0] === 10 &&
      serial[1] === 13) {

      currentCansList = [];
      const numberOfCans = serial[2];
      var j = 3;
      for (var i = 0; i < numberOfCans; i++) {
        const a = serial[j];
        const b = serial[j + 1];
        const rfId = (a << 8) | b;

        //Adding can object to array
        currentCansList.push(rfId);
        j += 2;
      }

      if (tripStatus === 1) {

        // Check if any cans already exist in data, if exist , delete all of them
        const getAllCans = "SELECT * FROM cans;"
        db.query(getAllCans, (err, result) => {
          if (err) return;
          if (result.length != 0) {
            const deleteAllCans = "truncate cans"
            db.query(deleteAllCans, (err, result) => {
              if (err) return;
              insertCansIntoDatabase();
            });
          } else {
            insertCansIntoDatabase();
          }
        })
        updateBaseCansOnServer()
        setTripStatus(2)
      } else if (tripStatus == 2) {
        compareCansQuantity();
      }

    } else {
      console.log("Data invalid")
    }
  })

  socket.on("locationUpdate" , data => {
    console.log(data);
  })
  
  socket.on('disconnect', () => { console.log("Client Disconnected") });
});

function updateBaseCansOnServer() {
  const updateTripUrl = constants.baseUrl + "trips/" + tripId;
  const jerrycansList = [];
  currentCansList.forEach(rfId => {
    jerrycansList.push({ "rfId": `${rfId}`, "isEmptied": false })
  })
  const data = {
    "jerrycans": jerrycansList,
    "jerrycansQuantity": jerrycansList.length
  }
  console.log("JerryCan length is ", jerrycansList.length);
 
  request({
    method: "PUT",
    uri: updateTripUrl,
    json: data
  }, function (err, response, body) {
    if (err) {
      console.log(err);
    } else {
      console.log("Base perrycans syncronised with server");
    }
  });

  const logUrl = constants.baseUrl + "logs";
  const logData = {
    "trip": [tripId],
    "message": "Trip started at " + format.asString('yyyy-MM-dd hh:mm', new Date())
  }
  request.post(logUrl, { form: logData });
}

function compareCansQuantity() {

  // Check if any cans already exist in data, if exist , delete all of them
  const deleteAllCans = "truncate tempcans"
  db.query(deleteAllCans, (err1, r1) => {
    if (err1) return1;

    const insertCans = "INSERT INTO tempcans (rfId) VALUES ?";
    const tempArray = []
    currentCansList.forEach(rf => {
      tempArray.push([rf])
    })
    db.query(insertCans, [tempArray], function (err2, dumpResult) {
      if (err2) return2;
      console.log("Current fetched cans is: ", dumpResult.affectedRows);

      //Compare between cans table and tempcans table
      const query = "SELECT * FROM cans;";
      db.query(query, function (err3, allCansList) {

        //loop through all base cans
        allCansList.forEach(can => {
          const rfId = can.rfId;
          const query2 = `SELECT * FROM tempcans WHERE rfId = '${rfId}'`
          db.query(query2, (err4, cansFoundinTempTable) => {
            if (cansFoundinTempTable.length === 0) {

              var isDuplicate = false;
              missingCansList.forEach(perrycan => {
                if (perrycan.id === rfId) {
                  isDuplicate = true;
                  return;
                }
              })

              if (!isDuplicate) {
                missingCansList.push({ "id": rfId, "time": new Date().getTime() });
                setTimeout(() => {
                  reportMissing(rfId)
                }, constants.delay * 1000);
              }
            }
          })

        })

      })

      //check if any missing can is found
      missingCansList.forEach((perrycan, index) => {
        if (perrycan.hasOwnProperty("isLost")) {
          const query = `SELECT * FROM tempcans WHERE rfId = '${perrycan.id}'`
          db.query(query, function (err, result) {
            if (result.length != 0) {
              missingCansList.splice(index, 1)

              //Logging  to server
              const timeDiff = utils.timeDifference(new Date().getTime() , perrycan.time);
              console.log(`Found the ${perrycan.id} can after ${timeDiff} of missing.`)
              const logUrl = constants.baseUrl + "logs";
              const logData = {
                "trip": [tripId],
                "message": `✅RfId ${perrycan.id} found after ${timeDiff} of missing`
              }
              request.post(logUrl, { form: logData });
            }
          })
        }
      })
    })

  });


}

function reportMissing(rfId) {
  const query = `SELECT * FROM tempcans WHERE rfId = '${rfId}'`
  db.query(query, (err, result) => {
    if (err) return;
    if (result.length != 0) {
      console.log("Found the missing perrycan ", rfId, " before delay.")
      missingCansList.forEach((perrycan, index) => {
        if (perrycan.id == rfId) {
          missingCansList.splice(index, 1);
        }
      })
    } else {
      console.log(`Can with Rf Id ${rfId} is missing`)
      //Logging to server
      const logUrl = constants.baseUrl + "logs";
      const logData = {
        "trip": [tripId],
        "message": `⚠RfId ${rfId} can missing`
      }
      request.post(logUrl, { form: logData });

      missingCansList.forEach((perrycan, index) => {
        if (perrycan.id == rfId) {
          perrycan.isLost = true;
          // if(websocket != null){
          //   console.log("Reporting missing to customer")
          // // websocket.emit("missingPerrycan" , perrycan);
          // }
        }
      })
    }
  })
  console.log(missingCansList);
}

function insertCansIntoDatabase() {
  //Inserts all new cans into the database
  const insertCans = "INSERT INTO cans (rfId) VALUES ?";
  const tempArray = []
  currentCansList.forEach(rf => {
    tempArray.push([rf])
  })
  db.query(insertCans, [tempArray], function (err, dumpResult) {
    if (err) { console.log(err.message) }
  })

  console.log("Base quanity of cans is " + currentCansList.length + " total");
}

function setTripId(trip_id) {
  const rawFile = fs.readFileSync("configurations");
  const data = JSON.parse(rawFile);
  data.trip_id = trip_id;

  fs.writeFileSync("configurations", JSON.stringify(data))
  tripId = trip_id;
}

function setTripStatus(trip_status) {
  const rawFile = fs.readFileSync("configurations");
  const data = JSON.parse(rawFile);
  data.trip_status = trip_status;

  fs.writeFileSync("configurations", JSON.stringify(data))
  tripStatus = trip_status;
}

function loadConfigurations() {
  if (fs.existsSync("configurations")) {
    const configString = fs.readFileSync("configurations");
    const configurations = JSON.parse(configString);
    tripStatus = configurations.trip_status;
    tripId = configurations.trip_id;
  } else {
    tripStatus = 0;
    tripId = null;
  }
}


