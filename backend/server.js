const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Ambulance = require("./models/Ambulance");
const Hospital = require("./models/Hospital");
const Patient = require("./models/Patient");

const {
  createPopulation,
  calculateFitness,
  selection,
  crossover,
  mutation,
  runGenerations,
} = require("./geneticAlgorithm");

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

//Patient routes

app.post("/api/patients", async (req, res) => {
  try {
    const patient = new Patient(req.body);

    const savedPatient = await patient.save();

    res.status(201).json(savedPatient);
  } catch (err) {
    res.status(400).json({
      message: "Failed to create Patient",
      error: err.message,
    });
  }
});

app.get("/api/patients", async (req, res) => {
  try {
    const patients = await Patient.find();

    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch Patients",
      error: err.message,
    });
  }
});

app.get("/api/patients/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.status(200).json(patient);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch Patients",
      error: err.message,
    });
  }
});

app.put("/api/patients/:id", async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedPatient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.status(200).json(updatedPatient);
  } catch (err) {
    res.status(400).json({
      message: "Failed to update Patient",
      error: err.message,
    });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);

    if (!deletedPatient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.status(200).json({
      message: "Patient deleted successfully",
      patient: deletedPatient,
    });
  } catch (err) {
    res.status(400).json({
      message: "Failed to delete Patient",
      error: err.message,
    });
  }
});

// Route distance calculation = Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;

  const latitudeDifference = ((lat2 - lat1) * Math.PI) / 180;
  const longitudeDifference = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

app.get(
  "/api/routes/calculate/:ambulanceId/:patientId/:hospitalId",
  async (req, res) => {
    try {
      const { ambulanceId, patientId, hospitalId } = req.params;

      const ambulance = await Ambulance.findById(ambulanceId);
      const patient = await Patient.findById(patientId);
      const hospital = await Hospital.findById(hospitalId);

      if (!ambulance) {
        return res.status(404).json({
          message: "Ambulance not found",
        });
      }

      if (!patient) {
        return res.status(404).json({
          message: "Patient not found",
        });
      }

      if (!hospital) {
        return res.status(404).json({
          message: "Hospital not found",
        });
      }

      const ambulanceToPatient = calculateDistance(
        ambulance.currentLocation.latitude,
        ambulance.currentLocation.longitude,
        patient.location.latitude,
        patient.location.longitude,
      );

      const patientToHospital = calculateDistance(
        patient.location.latitude,
        patient.location.longitude,
        hospital.location.latitude,
        hospital.location.longitude,
      );

      const totalDistance = ambulanceToPatient + patientToHospital;

      res.status(200).json({
        ambulance: ambulance._id,
        patient: patient._id,
        hospital: hospital._id,

        route: {
          ambulanceToPatient: Number(ambulanceToPatient.toFixed(2)),
          patientToHospital: Number(patientToHospital.toFixed(2)),
          totalDistance: Number(totalDistance.toFixed(2)),
        },

        unit: "kilometers",
      });
    } catch (err) {
      res.status(400).json({
        message: "Failed to calculate route",
        error: err.message,
      });
    }
  },
);

// Generate possible route combinations for a patient
app.get("/api/routes/options/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const ambulances = await Ambulance.find();
    const hospitals = await Hospital.find();

    const routes = [];

    for (const ambulance of ambulances) {
      for (const hospital of hospitals) {
        const ambulanceToPatient = calculateDistance(
          ambulance.currentLocation.latitude,
          ambulance.currentLocation.longitude,
          patient.location.latitude,
          patient.location.longitude,
        );

        const patientToHospital = calculateDistance(
          patient.location.latitude,
          patient.location.longitude,
          hospital.location.latitude,
          hospital.location.longitude,
        );

        const totalDistance = ambulanceToPatient + patientToHospital;

        routes.push({
          ambulance: ambulance._id,
          patient: patient._id,
          hospital: hospital._id,
          ambulanceNumber: ambulance.ambulanceNumber,
          hospitalName: hospital.name,
          route: {
            ambulanceToPatient: Number(ambulanceToPatient.toFixed(2)),
            patientToHospital: Number(patientToHospital.toFixed(2)),
            totalDistance: Number(totalDistance.toFixed(2)),
          },
        });
      }
    }

    const numberOfGenerations = 5;

    const generations = runGenerations(routes, numberOfGenerations);

    // Get the final population
    const finalGeneration = generations[generations.length - 1];

    const finalPopulation = finalGeneration.mutatedChildren;

    // Find the individual with the highest fitness
    const bestRoute = finalPopulation.reduce((best, current) => {
      if (current.fitness > best.fitness) {
        return current;
      }

      return best;
    });

    res.status(200).json({
      patient: patient._id,
      totalRoutes: routes.length,
      routes: routes,
      numberOfGenerations: numberOfGenerations,
      bestRoute: bestRoute,
      generations: generations,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error calculating routes",
      error: error.message,
    });
  }
});

// Find the shortest possible route for a patient
app.get("/api/routes/shortest/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const ambulances = await Ambulance.find({
      status: "available",
    });

    const hospitals = await Hospital.find({
      emergencyAvailable: true,
      availableBeds: { $gt: 0 },
    });

    let shortestRoute = null;

    for (const ambulance of ambulances) {
      for (const hospital of hospitals) {
        const ambulanceToPatient = calculateDistance(
          ambulance.currentLocation.latitude,
          ambulance.currentLocation.longitude,
          patient.location.latitude,
          patient.location.longitude,
        );

        const patientToHospital = calculateDistance(
          patient.location.latitude,
          patient.location.longitude,
          hospital.location.latitude,
          hospital.location.longitude,
        );

        const totalDistance = ambulanceToPatient + patientToHospital;

        if (
          shortestRoute === null ||
          totalDistance < shortestRoute.totalDistance
        ) {
          shortestRoute = {
            ambulance: ambulance._id,
            patient: patient._id,
            hospital: hospital._id,

            ambulanceNumber: ambulance.ambulanceNumber,
            hospitalName: hospital.name,

            route: {
              ambulanceToPatient: Number(ambulanceToPatient.toFixed(2)),
              patientToHospital: Number(patientToHospital.toFixed(2)),
              totalDistance: Number(totalDistance.toFixed(2)),
            },

            unit: "kilometers",
          };
        }
      }
    }
    // No route was possible
    if (!shortestRoute) {
      return res.status(404).json({
        message: "No available route found",
      });
    }

    res.status(200).json({
      message: "Shortest route found successfully",
      route: shortestRoute,
    });
  } catch (err) {
    res.status(400).json({
      message: "Failed to find shortest route",
      error: err.message,
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
