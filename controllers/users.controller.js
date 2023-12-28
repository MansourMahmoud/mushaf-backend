const asyncWrapper = require("../middleware/asyncWrapper");
const User = require("../models/user.model");
const appError = require("../utils/appError");
const bcryptjs = require("bcryptjs");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const returnJson = require("../utils/returnJson");
const storage = require("../helpers/firebase");
const {
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} = require("firebase/storage");
const { USER, ADMIN, MANAGER } = require("../utils/userRols");

const getAllUsers = asyncWrapper(async (req, res, next) => {
  const users = await User.find();
  return returnJson(res, 200, SUCCESS, "fetch is successful", { users });
});

const getSingleUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (!user) {
    const error = appError.create("user not found", 400, FAIL);
    return next(error);
  }

  return returnJson(res, 200, SUCCESS, "fetch is successful", { user });
});

const updateUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  const reqBody = req.body;
  const file = req?.file;

  const user = await User.findById({ _id: userId });

  if (!user) {
    const error = appError.create("user not found", 400, FAIL);
    return next(error);
  }

  // Update avatar if a new file is provided

  let avatar = null;

  if (file) {
    const exImage = file.mimetype.split("/").pop();
    let exName = file.originalname.split(`.${exImage}`)[0];

    const newImageRef = ref(
      storage,
      `users-avatar/${exName + Date.now() + "." + exImage}`
    );

    // Upload the new file
    const metadata = {
      contentType: file.mimetype,
    };

    if (
      user.avatar ===
      "https://firebasestorage.googleapis.com/v0/b/mushaf-online.appspot.com/o/users-avatar%2Fdownload.png?alt=media&token=0cb290d9-3a33-4650-9ee3-6ad421d6e59b"
    ) {
      const snapshot = await uploadBytesResumable(
        newImageRef,
        req.file.buffer,
        metadata
      );

      // Grab the public url
      const downloadURL = await getDownloadURL(snapshot.ref);
      avatar = downloadURL;

      // save in database
      await User.findByIdAndUpdate(userId, {
        $set: { avatar: downloadURL },
      });
    } else {
      const imagePath = user.avatar;

      // إنشاء كائن URL باستخدام الرابط
      const url = new URL(imagePath);

      // الحصول على جزء المسار من الرابط
      const path = url.pathname;

      // تقسيم جزء المسار باستخدام "/" والحصول على آخر عنصر (اسم الملف)
      const fileName = path.split("users-avatar%2F").pop();
      const pureFileName = decodeURIComponent(fileName);

      // the current file
      const currentImageRef = ref(storage, `users-avatar/${pureFileName}`);

      // Delete the current file
      await deleteObject(currentImageRef);

      // create a new file
      const snapshot = await uploadBytesResumable(
        newImageRef,
        req.file.buffer,
        metadata
      );

      // Grab the public url
      const downloadURL = await getDownloadURL(snapshot.ref);
      avatar = downloadURL;

      // save in database
      await User.findByIdAndUpdate(userId, {
        $set: { avatar: downloadURL },
      });
    }
  }

  if (reqBody.user_name) {
    // Update other user information
    await User.findByIdAndUpdate(userId, {
      $set: {
        user_name: reqBody.user_name && reqBody.user_name,
      },
    });
  }

  if (
    reqBody.role === USER ||
    reqBody.role === ADMIN ||
    reqBody.role === MANAGER
  ) {
    // Update other user information
    await User.findByIdAndUpdate(userId, {
      $set: {
        role: reqBody.role && reqBody.role,
      },
    });
  }

  const updatedUser = await User.findById({ _id: userId });

  return returnJson(res, 200, SUCCESS, "Updated user data", {
    user: updatedUser,
  });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findById({ _id: userId });

  if (!user) {
    const error = appError.create("user not found", 400, FAIL);
    return next(error);
  }

  // حذف الصورة الخاصة به من قاعدة بيانات فاير بيز
  const imagePath = user.avatar;

  // إنشاء كائن URL باستخدام الرابط
  const url = new URL(imagePath);

  // الحصول على جزء المسار من الرابط
  const path = url.pathname;

  // تقسيم جزء المسار باستخدام "/" والحصول على آخر عنصر (اسم الملف)
  const fileName = path.split("users-avatar%2F").pop();
  const pureFileName = decodeURIComponent(fileName);

  // the current file
  const currentImageRef = ref(storage, `users-avatar/${pureFileName}`);

  // Delete the current file
  await deleteObject(currentImageRef);

  const deletedUser = await User.deleteOne({ _id: userId });

  return returnJson(res, 200, SUCCESS, "Deleted user data", {
    user: null,
  });
});

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
