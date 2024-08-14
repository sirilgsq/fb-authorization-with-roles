const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccountJson = () => {
  const serviceAccountPath = process.env.FB_ADMIN_SDK_JSON_PATH;
  if (!serviceAccountPath) {
    throw new Error("FB_ADMIN_SDK_JSON_PATH environment variable is not set.");
  }
  fs.readFile(serviceAccountPath, "utf8", (err, data) => {
    if (err) {
      throw new Error(`Error reading the JSON file: ${err}`);
    }

    try {
      return JSON.parse(data);
    } catch (parseError) {
      throw new Error(`Error parsing the JSON file: ${parseError}`);
    }
  });
};

const serviceAccount = serviceAccountJson();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://decotherapynode-default-rtdb.firebaseio.com/",
});
const fdb = admin.firestore();
const rdb = admin.database();

module.exports = {
  admin,
  fdb,
  rdb,
};
