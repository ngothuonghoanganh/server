// var admin = require("firebase-admin");
import * as admin from "firebase-admin"
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://swd391-2dd07-default-rtdb.firebaseio.com"
});
export const bucket = admin.storage().bucket("gs://swd391-2dd07.appspot.com");