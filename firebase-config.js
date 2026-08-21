// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfxLa4jX8w57Os9Rn5xmO0Quj-A20j6qo",
  authDomain: "pallituri-bojanam.firebaseapp.com",
  projectId: "pallituri-bojanam",
  storageBucket: "pallituri-bojanam.firebasestorage.app",
  messagingSenderId: "794009998071",
  appId: "1:794009998071:web:3ba4526ed89e0088bd79f2",
  measurementId: "G-HS9DHNTGD6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
