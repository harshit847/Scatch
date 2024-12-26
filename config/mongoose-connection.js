const mongoose = require('mongoose');
const config = require('config');
const dbgr = require("debug")("development:mongoose");

// Use the MONGO_URI environment variable if available, otherwise fallback to config
const mongoURI = process.env.MONGO_URI || config.get("mongoURI");

mongoose
  .connect(`${mongoURI}/bags`) // Assuming you want to connect to the 'bags' database
  .then(function () {
    dbgr("connected");
  })
  .catch(function (err) {
    dbgr(err);
  });

module.exports = mongoose.connection;
