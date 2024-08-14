const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccountPath = process.env.FB_ADMIN_SDK_JSON_PATH;
if (!serviceAccountPath) {
  throw new Error("FB_ADMIN_SDK_JSON_PATH environment variable is not set.");
}
const serviceAccountJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, serviceAccountPath), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountJson),
  databaseURL: "https://decotherapynode-default-rtdb.firebaseio.com/",
});
const fdb = admin.firestore();
const rdb = admin.database();

module.exports = {
  admin,
  fdb,
  rdb,
};
