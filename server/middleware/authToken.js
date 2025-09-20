const jwt = require("jsonwebtoken");
const User = require("../database/userDB");
const ApiKey = require("../database/apiKeyDB");

const authenticateToken = async (req, res, next) => {
  const apiKey = req.headers["api-key"];
  if (apiKey) {
    try {
      // Find user associated with the API key
      const apiKeyDoc = await ApiKey.findOne({ key: apiKey });
      if (!apiKeyDoc) {
        return res.status(404).json({ success: false, message: "API Key not found" });
    }

      const user = await User.findById(apiKeyDoc.userId);
      if (!user) {
        return res.status(403).json({ message: "Invalid API key" });
      }

      // Attach user information to the request object
      req.user = user;
      req.siteId = apiKeyDoc._id;
      
      return next();
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
    }
  }

  // fallback if no api key is provided
  const token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  const requestedToken = token.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Failed to Authorized." });
  }

  try {
    const decodedToken = jwt.verify(token.split(" ")[1], "Key_Manager_Backend");
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(403).json({ message: "Invalid user" });
    }

    const session = user.sessions.find(session => session.token === requestedToken);
    if (!session) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token", err });
  }
};

module.exports = authenticateToken;
