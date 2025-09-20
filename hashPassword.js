// hashPassword.js
const bcrypt = require("bcrypt");

(async () => {
  const plainPassword = "Forid@@2024"; // your admin password
  const saltRounds = 10;

  try {
    const hashed = await bcrypt.hash(plainPassword, saltRounds);
    console.log("Plain:", plainPassword);
    console.log("Hashed:", hashed);
  } catch (err) {
    console.error(err);
  }
})();
