// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaSyZxIO-1Eb2-1Uv1alExjTXJ0gV8NGM",
  authDomain: "mushaf-online.firebaseapp.com",
  projectId: "mushaf-online",
  storageBucket: "mushaf-online.appspot.com",
  messagingSenderId: "774254431590",
  appId: "1:774254431590:web:94a63d34473decf45d4ca7",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

module.exports = storage;
