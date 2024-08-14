const axios = require("axios");
const {
  OK,
  BAD_REQUEST,
  UNAUTHORIZED,
  _BAD_REQUEST_MESSAGE,
  _UNAUTHORIZED_ERROR_MESSAGE,
} = require("../constants");

/**
 * Generates a new access token using a refresh token.
 *
 * This function sends a POST request to the Firebase token endpoint to exchange the provided
 * refresh token for a new access token.
 *
 * @param {string} refreshToken - The refresh token used to obtain a new access token.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status
 *   and either the new access token or an error message.
 * @throws {Error} - Throws an error if the request to obtain the access token fails.
 */
const generateAccessToken = async (refreshToken) => {
  // Validate the refresh token
  if (!refreshToken) {
    return {
      status: UNAUTHORIZED,
      message: _UNAUTHORIZED_ERROR_MESSAGE,
    };
  }

  try {
    // Make a POST request to the Firebase token endpoint to exchange the refresh token for a new access token
    const response = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${process.env.FB_API_KEY}`,
      {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }
    );

    // Check the response status and return the access token or an error message
    if (response.status === OK) {
      return {
        status: OK,
        token: response.data.access_token || "",
      };
    } else {
      return {
        status: BAD_REQUEST,
        message: _BAD_REQUEST_MESSAGE,
      };
    }
  } catch (error) {
    // Handle any errors that occur during the request
    return {
      status: UNAUTHORIZED,
      error: error.response ? error.response.data.error.message : error.message,
    };
  }
};

module.exports = generateAccessToken;
