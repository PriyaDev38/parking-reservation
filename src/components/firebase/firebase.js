import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, update, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC9eC22YIpABgmQWXUyuG0WPb-urZHYwY0",
  authDomain: "proj-ba6c8.firebaseapp.com",
  databaseURL: "https://proj-ba6c8-default-rtdb.firebaseio.com",
  projectId: "proj-ba6c8",
  storageBucket: "proj-ba6c8.firebasestorage.app",
  messagingSenderId: "55589927529",
  appId: "1:55589927529:web:deacfa4dd119d54c0240f8",
  measurementId: "G-2DMN38KSHG",
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

export { database, ref, get, set, update, remove };
