module.exports = class utils {
   static getCurrentDate(){
        const date = new Date();
        const dateString = date.getFullYear() + '-' + date.getMonth() + '-' + 
        date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
        return dateString;
    }
}