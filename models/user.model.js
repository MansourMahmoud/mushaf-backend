const mongoose = require("mongoose");
const { USER, ADMIN, MANAGER } = require("../utils/userRols");

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  role: {
    type: String, // ['USER', 'ADMIN', 'MANAGER']
    enum: [USER, ADMIN, MANAGER],
    default: USER,
  },
  avatar: {
    type: String,
    default:
      "https://firebasestorage.googleapis.com/v0/b/mushaf-online.appspot.com/o/users-avatar%2Fdownload.png?alt=media&token=0cb290d9-3a33-4650-9ee3-6ad421d6e59b",
  },
});

module.exports = mongoose.model("User", userSchema);
