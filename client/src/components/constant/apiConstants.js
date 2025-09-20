// Define constants for API configuration
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const API_CONFIG = {
  API_ENDPOINT: isLocalhost
    ? "http://localhost:3000"
    : "https://keys.tic.com.bd",
  TOKEN_STORAGE_KEY: "auth_token",
  USER_STORAGE_KEY: "user_data",
  DOMAIN_URL: isLocalhost ? "http://localhost:3000" : "https://keys.tic.com.bd",
  SITE_URL: isLocalhost ? "http://localhost:5173" : "https://keys.tic.com.bd",
};

// live server
// const isLocalhost =
//   window.location.hostname === "front.dinjob.com" ||
//   window.location.hostname === "127.0.0.1" ||
//   window.location.hostname === "localhost";
// const API_CONFIG = {
//   API_ENDPOINT: isLocalhost
//     ? "https://server.dinjob.com"
//     : "https://keys.tic.com.bd",
//   TOKEN_STORAGE_KEY: "auth_token",
//   USER_STORAGE_KEY: "user_data",
//   DOMAIN_URL: isLocalhost ? "https://server.dinjob.com" : "https://keys.tic.com.bd",
// };

// Freeze the API configuration object to make it immutable
Object.freeze(API_CONFIG);

// Export the API configuration object for use in other modules
export default API_CONFIG;
