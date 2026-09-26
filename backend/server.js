const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDb connected successfully");
  })
  .catch((err) => {
    console.log("MongoDB connection failed", err);
  });

app.get("/", (req, res) => {
  res.send("Project is running successfully");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
