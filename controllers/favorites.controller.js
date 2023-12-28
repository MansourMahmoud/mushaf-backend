const asyncWrapper = require("../middleware/asyncWrapper");
const User = require("../models/user.model");
const Favorite = require("../models/favorite.model");

const appError = require("../utils/appError");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const returnJson = require("../utils/returnJson");

const getAllFavoritesOfUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;

  const favorites = await Favorite.find({ user_id: userId });

  if (!favorites) {
    const error = appError.create("favorites not found", 400, FAIL);
    return next(error);
  }

  return returnJson(res, 201, SUCCESS, "fetch is successful", { favorites });
});

const addFavorite = asyncWrapper(async (req, res, next) => {
  const { user_id, favorite } = req.body;

  const user = await User.findById(user_id);

  if (!user) {
    const error = appError.create("Invalid user_id", 400, FAIL);
    return next(error);
  } else if (!favorite) {
    const error = appError.create("favorite must be an Object", 400, FAIL);
    return next(error);
  }

  const newFavorite = await new Favorite({
    user_id,
    favorite,
  });

  await newFavorite.save();

  return returnJson(res, 201, SUCCESS, "Favourite successfully stored", {
    favorite: newFavorite,
  });
});

const deleteFavorite = asyncWrapper(async (req, res, next) => {
  const favoriteId = req.params.favoriteId;

  const favorite = await Favorite.findById({ _id: favoriteId });

  if (!favorite) {
    const error = appError.create("favorite not found", 400, FAIL);
    return next(error);
  }

  await Favorite.deleteOne({ _id: favoriteId });

  return returnJson(
    res,
    201,
    SUCCESS,
    "favorite has been deleted successfully",
    { data: null }
  );
});

module.exports = {
  getAllFavoritesOfUser,
  addFavorite,
  deleteFavorite,
};
