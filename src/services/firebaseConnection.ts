import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBuwMyqZWiA6N6tPNGzBsC0XPiksBLd1aU",
  authDomain: "webcarros-402f5.firebaseapp.com",
  projectId: "webcarros-402f5",
  storageBucket: "webcarros-402f5.appspot.com",
  messagingSenderId: "235820514633",
  appId: "1:235820514633:web:3c4ae88678a039210c2e98"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {db, auth, storage}