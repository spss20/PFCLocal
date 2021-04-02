
const delay = 7; //(in Seconds) Tells the delay between rf missing and rf found which can be left unnoticed otherwise will report as missing
const gpsFrequency = 10; //(in Seconds) Tells how often system will update gps location to ril server
const stockFrequency = 10; //(in Seconds) Tells how often stock will be pushed to relience server.
const isAGroupEnabled = true; //(true, false) tells the system if group a is present in system of not which is reponsible to determine which tank is emptied.
const baseUrl = "http://localhost:1337/"

exports.delay = delay;
exports.gpsFrequency = gpsFrequency;
exports.stockFrequency = stockFrequency;
exports.isAGroupEnabled = isAGroupEnabled;
exports.baseUrl = baseUrl;