const admin = require("firebase-admin");

const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_JSON_STRING;
const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountString, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(process.env.FB_ADMIN_SDK_JSON_PATH),
  databaseURL: "https://decotherapynode-default-rtdb.firebaseio.com/",
});
const fdb = admin.firestore();
const rdb = admin.database();

module.exports = {
  admin,
  fdb,
  rdb,
};
