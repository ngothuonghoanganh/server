// var admin = require("firebase-admin");
import * as admin from "firebase-admin";
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wsg-authen-144ba-default-rtdb.firebaseio.com",
});

export const bucket = admin.storage().bucket("gs://wsg-authen-144ba.appspot.com");

export const database = admin.database();

export const fireStore = admin.firestore()