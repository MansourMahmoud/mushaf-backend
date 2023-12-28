const express = require("express");
const router = express.Router();

// ================== import Users controllers ==================
const { register, login, logout } = require("../controllers/auth.controller");
const {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");
// ================== end ==================

// ================== import middleware/uploadFileUser ==================
const upload = require("../middleware/uploadFileUser");
// ================== end ==================

// ================== import Favorite controllers ==================
const {
  addFavorite,
  getAllFavoritesOfUser,
  deleteFavorite,
} = require("../controllers/favorites.controller");
// ================== end ==================

// ================== routes ==================
//======== user CRUD
router.route("/").get(getAllUsers);

router
  .route("/:userId")
  .get(getSingleUser)
  .patch(upload.single("avatar"), updateUser)
  .delete(deleteUser);
//======== end

//======== Users favorites CRUD
router.route("/favorites").post(addFavorite);
router.route("/favorites/:userId").get(getAllFavoritesOfUser);
router.route("/favorites/:favoriteId").delete(deleteFavorite);
//======== end

//======== auth
router.route("/register").post(upload.single("avatar"), register);

router.route("/login").post(login);

router.route("/logout/:userId").get(logout);
//======== end

// ================== end ==================
module.exports = router;
