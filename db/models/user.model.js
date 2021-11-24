const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const UserModel = model("User", userSchema);

module.exports = UserModel;
