// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

export const getFirebaseApp = () => {
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyB6ubVUJ7nEgjJ18XDoU2M6SrLFKGxFKrY",
    authDomain: "whatsapp-c0705.firebaseapp.com",
    databaseURL: "https://whatsapp-c0705-default-rtdb.firebaseio.com",
    projectId: "whatsapp-c0705",
    storageBucket: "whatsapp-c0705.firebasestorage.app",
    messagingSenderId: "90690999379",
    appId: "1:90690999379:web:2b24119aa116fc85cde2a6",
    measurementId: "G-NSBDVND920",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  return app;
};
