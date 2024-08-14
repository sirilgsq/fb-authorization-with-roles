const { admin } = require("../config/firebase-admin");

/**
 * Verifies the provided Firebase ID token and retrieves user information.
 *
 * This function uses Firebase Admin SDK to verify the ID token and fetch user details
 * from Firebase Authentication.
 *
 * @param {string} token - The Firebase ID token to verify.
 * @returns {Promise<Object>} - A promise that resolves to an object containing user information,
 *   including `disabled` status, `customClaims`, and token details.
 * @throws {Error} - Throws an error if the verification or user retrieval fails.
 */
const verifyAndGetUserInfo = async (token) => {
  try {
    // Verify the ID token and decode it
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Retrieve user information based on the decoded token UID
    const { disabled, customClaims } = await admin
      .auth()
      .getUser(decodedToken.uid);

    // Return user information along with the decoded token
    return {
      disabled,
      customClaims,
      ...decodedToken,
      error: null,
    };
  } catch (error) {
    // Propagate any errors encountered during verification or user retrieval
    throw error;
  }
};

module.exports = verifyAndGetUserInfo;
