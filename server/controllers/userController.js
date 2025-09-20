const User = require("../database/userDB");
const bcrypt = require("bcrypt");
const { uploadLogo } = require("../utils/multerConfig");
const { randomBytes } = require("crypto");
const ApiKey = require("../database/apiKeyDB");

const userController = {
  getAllUser: async (req, res) => {
    try {
      const users = await User.find().select("-password -token -salt -apiKeys");
      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("Error in getAllUser:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  addUser: async (req, res) => {
    try {
      const { username, email, fullName, role, password } = req.body;

      // Check if username or email already exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
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

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new user instance
      const newUser = new User({
        username,
        email,
        profile: { fullName: fullName },
        role,
        password: hashedPassword,
      });

      console.log(req.body);

      // Save the user to the database
      await newUser.save();

      return res
        .status(201)
        .json({ success: true, message: "User added successfully" });
    } catch (error) {
      console.error("Error in addUser:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateUserProfile: async (req, res) => {
    try {
      const userId = req.query.id;
      const { fullName, city, country, post, gender, phoneNumber, birthDate } =
        req.body;

      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user profile fields
      user.profile.fullName = fullName;
      user.profile.address.city = city;
      user.profile.address.country = country;
      user.profile.gender = gender;
      user.phone_number = phoneNumber;
      user.profile.birthDate = birthDate;
      user.profile.address.zipCode;

      // Save the updated user profile to the database
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  uploadLogo: async (req, res) => {
    try {
      uploadLogo.single("logo")(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: "File upload failed" });
        }

        // Get path to uploaded file
        const logoPath = req.file.path;

        res.status(200).json({
          success: true,
          message: "Logo uploaded successfully",
          logoPath,
        });
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteUser: async (req, res) => {
    const userId = req.query.id;
    try {
      const deleteuser = await User.findByIdAndDelete(userId);
      if (!deleteuser) {
        return res.status(400).json({ message: "Product not found" });
      }
      res.json({
        message: `User {${deleteuser.username}} delete successfully.`,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = userController;
