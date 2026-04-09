import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

function configLooksReady(config) {
  return Object.values(config).every((value) => typeof value === "string" && !value.startsWith("REPLACE_WITH"));
}

let app = null;
let auth = null;
let db = null;
let firebaseReady = false;

if (configLooksReady(firebaseConfig)) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  firebaseReady = true;
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

export { auth, db, firebaseReady };
