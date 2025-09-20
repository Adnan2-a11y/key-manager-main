const express = require("express");
require('dotenv').config()
require('./utils/cronJobs');
require('./utils/telegramBot');
require('./utils/syncWorkerWooProducts');
const cookieParser = require("cookie-parser");
const connectDB = require("./database/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoute");
const serialNumberRoutes = require("./routes/serialNumberRoute");
const supplierRoute = require("./routes/supplierRoute");

const integrationsRoutes = require("./routes/integrationsRoutes");
const shopRoutes = require("./routes/shopRoutes");
const storeRoutes = require("./routes/storeRoutes");
const multiDashRoutes = require("./routes/multiDashRoutes");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());


app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/product", productRoutes);
app.use("/api/product", categoryRoutes);
app.use("/api", stockRoutes);
app.use("/api/serial-numbers", serialNumberRoutes);
app.use("/api/suppliers", supplierRoute);

app.use("/api/integration", integrationsRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/store", storeRoutes);

app.use("/api/v2/multi-dashboard", multiDashRoutes);


connectDB();

app.get("/", (req, res) => {
  res.send(`Server is running.`);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT} successfully.`)
);
