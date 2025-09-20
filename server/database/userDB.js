const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
  },

  role: {
    type: String,
    default: "user",
    enum: ["admin", "manager", "user"], // Possible roles
  },
  profile: {
    fullName: String,
    birthDate: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    resellerChatId: String,
    telegramUsername: String,
    avatar: String,
    address: {
      city: String,
      division: String,
      zipCode: String,
      country: String,
    },
  },
  phone_number: {
    type: String,
  },
  sessions: [
    {
      token: { type: String, required: true },
      userAgent: String, // Store device info (optional)
      ip: String, // Store IP (optional)
      createdAt: { type: Date, default: Date.now }
    }
  ],
  apiKeys: [{ type: mongoose.Schema.Types.ObjectId, ref: "ApiKey" }],
  balance: {
    type: Number,
    default: 0,
  },
},
{
  timestamps: true,
  versionKey: false,
});

userSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }
  try {
    const maxUser = await User.findOne().sort({ userId: -1 }).exec();
    if (maxUser) {
      this.userId = maxUser.userId + 1;
    } else {
      this.userId = 10000;
    }
    next();
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
