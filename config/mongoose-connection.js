 const mongoose = require('mongoose');

require('dotenv').config();
 mongoose
 .connect(process.env.MONGODB_URI)
 .then(function(){
    console.log("connected");
 })
 .catch(function(err){
    console.log(err);
 })

 module.exports = mongoose.connection;