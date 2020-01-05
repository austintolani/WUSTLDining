// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// This represents the data structure of the recipes collection in the database 
const UserSchema = new Schema(
  {
    id: String,
    username: String,
    password: String
  },
  { timestamps: true }
);

UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};


// export the new Schema
module.exports = mongoose.model("users", UserSchema,"users");