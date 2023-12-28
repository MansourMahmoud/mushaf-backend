const mongoose = require("mongoose");

const favoritesSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  favorite: {
    type: Object,
    default: null,
    required: true,
  },
});

module.exports = mongoose.model("Favorite", favoritesSchema);
