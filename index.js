require("dotenv").config();

const express = require("express");
const app = express();
const { ERROE } = require("./utils/httpStatusText");
const cors = require("cors");

// use cors
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);
//

//======================= database connect =======================
const mongoose = require("mongoose");
const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
  console.log("mongodb connected successfully");
});

app.use(express.json());
//=================== end =======================

//======================= app routes =======================
const usersRouter = require("./routes/users.route");
app.use("/api/users", usersRouter);
// ======================= end =======================

// ======================= global middleware for not found router =======================
app.all("*", (req, res) => {
  return res
    .status(404)
    .json({ status: ERROE, message: "this resource is not availlable" });
});
// ======================= end =======================

// ======================= global error handler =======================
app.use((error, req, res, next) => {
  return res.status(error.code || 400).json({
    status: error.statusText || ERROE,
    message: error.message,
    code: error.code || 400,
  });
});

// ======================= end =======================

// ======================= app.listen =======================
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`listen on port: ${port}`);
});
// ======================= end =======================
