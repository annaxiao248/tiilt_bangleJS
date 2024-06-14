// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZgK4sbO-HxLHx_m5HVZR8mYXrCfR7SN0",
  authDomain: "tiilt-banglejs.firebaseapp.com",
  projectId: "tiilt-banglejs",
  storageBucket: "tiilt-banglejs.appspot.com",
  messagingSenderId: "405706953690",
  appId: "1:405706953690:web:78d492c2235d323eb0e6e3",
  measurementId: "G-P9G7QTNGXC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app)
