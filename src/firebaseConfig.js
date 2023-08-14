import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDe8UsqoUitF8Dto0w2X0ZG558YeFIFlrY",
  authDomain: "uffa-expence-tracker-app.firebaseapp.com",
  projectId: "uffa-expence-tracker-app",
  storageBucket: "uffa-expence-tracker-app.appspot.com",
  messagingSenderId: "148995235844",
  appId: "1:148995235844:web:aa46075344159f4a879551",
  measurementId: "G-GV0LRZBCWZ"
};

const app = initializeApp(firebaseConfig);
const fireDb = getFirestore(app);

export { fireDb, app };
