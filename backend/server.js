const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Ambulance = require("./models/Ambulance");
const Hospital = require("./models/Hospital");

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

//Ambulance routes
app.post("/api/ambulances", async (req, res) => {
  try {
    const ambulance = new Ambulance(req.body);

    const savedAmbulance = await ambulance.save();

    res.status(201).json(savedAmbulance);
  } catch (err) {
    res.status(400).json({
      message: "Failed to create Ambulance",
      error: err.message,
    });
  }
});

app.get("/api/ambulances", async (req, res) => {
  try {
    const ambulances = await Ambulance.find();

    res.status(200).json(ambulances);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch Ambulances",
      error: err.message,
    });
  }
});

app.put("/api/ambulances/:id", async (req, res) => {
  try {
    const updatedAmbulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedAmbulance) {
      return res.status(404).json({
        message: "Ambyulance was not fiund",
      });
    }

    res.status(200).json(updatedAmbulance);
  } catch (err) {
    res.status(400).json({
      message: "Failed to update Abbulance",
      error: err.message,
    });
  }
});

app.delete("/api/ambulances/:id", async (req, res) => {
  try {
    const deletedAmbulance = await Ambulance.findByIdAndDelete(req.params.id);

    if (!deletedAmbulance) {
      return res.status(404).json({
        message: "Ambulance not found",
      });
    }

    res.status(200).json({
      message: "Ambulance deleted successfully",
      ambulance: deletedAmbulance,
    });
  } catch (err) {
    res.status(400).json({
      message: "Failed to delete Ambulance",
      error: err.message,
    });
  }
});

// Hospital routes
app.post("/api/hospitals", async (req, res) => {
  try {
    const hospital = new Hospital(req.body);

    const savedHospital = await hospital.save();

    res.status(201).json(savedHospital);
  } catch (err) {
    res.status(400).json({
      message: "Failed to create Hospital",
      error: err.message,
    });
  }
});

app.get("/api/hospitals", async (req, res) => {
  try {
    const hospitals = await Hospital.find();

    res.status(200).json(hospitals);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch Hospitals",
      error: err.message,
    });
  }
});

app.get("/api/hospitals/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    res.status(200).json(hospital);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch Hospitals",
      error: err.message,
    });
  }
});

app.put("/api/hospitals/:id", async (req, res) => {
  try {
    const updatedHospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedHospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    res.status(200).json(updatedHospital);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update Hospital",
      error: err.message,
    });
  }
});

app.delete("/api/hospitals/:id", async (req, res) => {
  try {
    const deletedHospital = await Hospital.findByIdAndDelete(req.params.id);

    if (!deletedHospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    res.status(200).json({
      message: "Hospital deleted successfully",
      hospital: deletedHospital,
    });
  } catch (err) {
    res.status(400).json({
      message: "Failed to delete Hospital",
      error: err.message,
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
