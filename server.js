const express = require("express");

const authRoutes = require("./routes/authRoutes");
const flowersRoutes = require("./routes/flowersRoutes");
const cartRoutes = require("./routes/cartRoutes");
const dotenv = require("dotenv");
const cors = require("cors");

const http = require("http");
const { connectDB, sequelize } = require("./config/bd");

dotenv.config();

const syncDatabase = async () => {
  try {
    await sequelize.sync(); // Синхронизация моделей с базой данных
    console.log("Database synced");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

syncDatabase();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

connectDB();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/flowers", flowersRoutes);
app.use("/api/cart", cartRoutes);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
