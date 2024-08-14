const {
  OK,
  BAD_REQUEST,
  UNAUTHORIZED,
  _ACCOUNT_DISABLED_ERROR_MESSAGE,
  _UNAUTHORIZED_ERROR_MESSAGE,
  _ACCESS_DENIED_ERROR_MESSAGE,
} = require("./constants");
const verifyAndGetUserInfo = require("./utils/verify-and-get-user-info");
const generateAccessToken = require("./utils/generate-access-token");

/**
 * Middleware to authenticate users based on their roles.
 *
 * @param {Array<string>} [allowedRoles=[]] - Array of roles that are allowed to access the route. If empty, any authenticated user can access.
 * @param {string} accessTokenKey - Key for the access token in cookies.
 * @param {string} refreshTokenKey - Key for the refresh token in cookies.
 * @returns {Function} - Middleware function that authenticates the user.
 */
const fbAuthorizationWithRoles =
  (allowedRoles = [], accessTokenKey, refreshTokenKey) =>
  async (req, res, next) => {
    // Validate token keys
    if (!accessTokenKey || !refreshTokenKey) {
      return res
        .status(BAD_REQUEST)
        .json({ error: "accessTokenKey and refreshTokenKey are required" });
    }

    const token = req.cookies[accessTokenKey] || null;
    const refreshToken = req.cookies[refreshTokenKey] || null;

    // Check if the access token is present
    if (!token) {
      return respondWithUnauthorized(res, _ACCESS_DENIED_ERROR_MESSAGE);
    }

    try {
      // Verify and get user information from the token
      const { disabled, customClaims } = await verifyAndGetUserInfo(token);

      // Check if the user account is disabled
      if (disabled) {
        return respondWithUnauthorized(res, _ACCOUNT_DISABLED_ERROR_MESSAGE);
      }

      // If allowedRoles is not empty, check if the user has one of the allowed roles
      if (
        allowedRoles.length > 0 &&
        !verifyRoles(allowedRoles, customClaims?.roles || [])
      ) {
        return respondWithUnauthorized(res, _UNAUTHORIZED_ERROR_MESSAGE);
      }

      // Attach user information to the request and proceed to the next middleware
      req.user = customClaims;
      return next();
    } catch (error) {
      // Handle token expiration and attempt to refresh the access token
      if (error.code === "auth/id-token-expired" && refreshToken) {
        try {
          const { status, token: newToken } = await generateAccessToken(
            refreshToken
          );

          if (status === OK) {
            const { disabled, customClaims } = await verifyAndGetUserInfo(
              newToken
            );

            if (disabled) {
              return respondWithUnauthorized(
                res,
                _ACCOUNT_DISABLED_ERROR_MESSAGE
              );
            }

            // If allowedRoles is not empty, check if the user has one of the allowed roles
            if (
              allowedRoles.length > 0 &&
              !verifyRoles(allowedRoles, customClaims?.roles || [])
            ) {
              return respondWithUnauthorized(res, _UNAUTHORIZED_ERROR_MESSAGE);
            }

            // Attach user information to the request and set the new token in cookies
            req.user = customClaims;
            res.cookie(accessTokenKey, newToken, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
            });
            return next();
          } else {
            return respondWithUnauthorized(res, _ACCESS_DENIED_ERROR_MESSAGE);
          }
        } catch (refreshError) {
          return respondWithUnauthorized(
            res,
            _ACCESS_DENIED_ERROR_MESSAGE,
            refreshError
          );
        }
      } else {
        return respondWithUnauthorized(
          res,
          _ACCESS_DENIED_ERROR_MESSAGE,
          error
        );
      }
    }
  };

/**
 * Responds with an unauthorized error message.
 *
 * @param {Response} res - Express response object
 * @param {string} message - Error message to be sent in the response
 * @param {Object|null} error - Optional error object to be included in the response
 * @returns {Response} - Express response object
 */
const respondWithUnauthorized = (res, message, error = null) => {
  return res.status(UNAUTHORIZED).json({
    status: UNAUTHORIZED,
    message,
    error,
  });
};

/**
 * Checks if the user has one of the allowed roles.
 *
 * @param {Array<string>} allowedRoles - Array of roles that are allowed to access the route
 * @param {Array<string>} userRoles - Array of roles assigned to the user
 * @returns {boolean} - True if the user has one of the allowed roles, false otherwise
 */
const verifyRoles = (allowedRoles, userRoles) => {
  return userRoles.some((role) => allowedRoles.includes(role));
};

module.exports = { fbAuthorizationWithRoles, verifyAndGetUserInfo };
