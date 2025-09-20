const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../database/userDB");

const authController = {
  registration: async (req, res) => {
    try {
      const { username, email, password, name } = req.body;
      const existingUser = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });

      if (existingUser) {
        let errorMessage;
        if (existingUser.username === username) {
          errorMessage = "Username already exists!";
        } else if (existingUser.email === email) {
          errorMessage = "Email already exists!";
        } else {
          errorMessage = "User already exists";
        }
        return res.status(400).json({ message: errorMessage });
      }
      // Hash password

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        salt: salt,
        profile: {
          fullName: name,
        },
      });

      await newUser.save();

      return res.status(200).json({
        success: true,
        message: "User created successfully",
        data: {
          user: {
            name: newUser.name,
            username: newUser.username,
            email: newUser.email,
          },
        },
      });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Failed to register user", error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;

      const existingUser = await User.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      }).select("-salt -apiKeys");

      if (!existingUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // if (existingUser.token) {
      //   try {
      //     jwt.verify(existingUser.token, "Key_Manager_Backend");
      //     return res.status(400).json({ message: "User is already logged in" });
      //   } catch (error) {
      //     existingUser.token = null;
      //   }
      // }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate a new access token
      const token = generateAccessToken(existingUser);

      // Add the new access token to the user's record
      existingUser.sessions.push({
        token,
        userAgent: req.headers["user-agent"],
        ip: req.ip
      });
      await existingUser.save();

      res.status(200).json({
        message: "Login successful",
        accessToken: token
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },

  verifyToken: async (req, res) => {
    try {
      let token = req.headers.auth_token;
                                                                                          
      let extractedToken;
      if (token) {
        extractedToken = token.split(" ")[1]
      }else if(req.headers.cookie){
        const cookies = req.headers.cookie.split("; ");
        const authCookie = cookies.find(c => c.startsWith("accessToken="));
        if(authCookie){
          extractedToken = authCookie.split("=")[1]
        }
      }
      if (!extractedToken) {
        console.log("no token provided")
        return res.status(401).json({ message: "No token provided" });
      }

      // Decode Token with all extracted information
      const decodedToken = jwt.verify(extractedToken, "Key_Manager_Backend");

      const user = await User.findById(decodedToken.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // chec users.sessions for token
      const session = user.sessions.find(session => session.token === extractedToken);
      if (!session) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Optionally, you can return the user's information
      res.json({ success: true, user });
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  },

  logout: async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];

      // Invalidate the token by removing it from the user's record
      const user = await User.findById(req.user._id);
      console.log(token);
      user.sessions = user.sessions.filter(session => session.token !== token);
      await user.save();

      if (!user) {
        return res.status(404).json({ message: "No Login data found." });
      }

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
  logoutAll: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "No Login data found." });
      }

      user.sessions = [];
      await user.save();

      res.status(200).json({ message: "Logged out from all devices" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
};

// Helper function to generate access token
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    "Key_Manager_Backend",
    { expiresIn: "7d" }
  );
}

module.exports = authController;
