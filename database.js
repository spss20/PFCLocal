var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost" , 
    user : "surya",
    password : "spssikarwar",
    database: "pfc"
});

con.connect(function(err){
    if(err) throw err;
    console.log("Connected Successfuly");


})

module.exports = con;

// const sql = "INSERT INTO cans (rfId , isEmptied) VALUES ('ABCD' , 0) "

// con.query(sql , function (err , result){
//     if(err) throw err;
//     console.log(result);
//     console.log("Insert Id is: " , result.insertId);
//     console.log("Affected Rows: " , result.affectedRows);
// })

// const readAll = "SELECT * FROM cans";

// con.query(readAll , function (err , result){
//     if(err) throw err;
//     result.forEach(element => {
//         console.log(`Rf id for id ${element.id} is ${element.rfId}`)
//     });
// })

// const edit = "UPDATE cans SET isEmptied = 1 WHERE rfId = '45FG'";

// con.query(edit);

// const delSingle = "truncate cans"
// con.query(delSingle);

