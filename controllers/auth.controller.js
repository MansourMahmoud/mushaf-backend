const asyncWrapper = require("../middleware/asyncWrapper");
const User = require("../models/user.model");
const appError = require("../utils/appError");
const bcryptjs = require("bcryptjs");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const returnJson = require("../utils/returnJson");
const generateJWT = require("../utils/generateJWT");

// ============ import things from firebase =============
const storage = require("../helpers/firebase");

const {
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
// ============ end ============

// ============ import v4 from uuid =============
const { v4 } = require("uuid");
// ============ end =============

const register = asyncWrapper(async (req, res, next) => {
  const { user_name, email, password, role } = req.body;
  const file = req?.file;

  // check if user already exist
  const user = await User.findOne({ email });

  if (user) {
    const error = appError.create("user already exist", 400, FAIL);
    return next(error);
  }
  // end

  // handle avatar
  let avatar = null;

  if (file) {
    const exImage = file.mimetype.split("/").pop();
    let exName = file.originalname.split(`.${exImage}`)[0];

    const userAvatarRef = ref(
      storage,
      `users-avatar/${exName + Date.now() + "." + exImage}`
    );

    const metadata = {
      contentType: file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      userAvatarRef,
      req.file.buffer,
      metadata
    );

    // Grab the public url
    const downloadURL = await getDownloadURL(snapshot.ref);

    avatar = downloadURL;
  }
  // end

  const hashedPassword = await bcryptjs.hash(password, 10);

  const newUser = new User({
    user_name,
    email,
    password: hashedPassword,
    role,
    avatar: avatar
      ? avatar
      : "https://firebasestorage.googleapis.com/v0/b/smart-e-commerce-815a7.appspot.com/o/users-photos%2Fdownload.png?alt=media&token=b160e7e9-7e9e-4cff-a5b3-547bcf8e94eb",
  });

  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });

  newUser.token = token;
  await newUser.save();

  return returnJson(res, 201, SUCCESS, "Sign Up successful", { user: newUser });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    const error = appError.create("Your email is required", 400, FAIL);
    return next(error);
  } else if (!password) {
    const error = appError.create("Your password is required", 400, FAIL);
    return next(error);
  }

  const user = await User.findOne({ email });

  const errorAuth = appError.create("Invalid email or password", 400, FAIL);

  if (!user) {
    return next(errorAuth);
  }

  const matchedPassword = await bcryptjs.compare(password, user.password);

  if (!matchedPassword) {
    return next(errorAuth);
  } else {
    // logged in successfully
    const token = await generateJWT({
      email: user.email,
      id: user._id,
      role: user.role,
    });

    return returnJson(res, 200, SUCCESS, "login successfully", { token });
  }
});

const logout = asyncWrapper(async (req, res, next) => {});

module.exports = {
  register,
  login,
  logout,
};
