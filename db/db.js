const mongoose = require("mongoose");

function connectMongoDb() {
  return mongoose.connect("mongodb://localhost:27017/jwt-auth");
}

module.exports = connectMongoDb;
