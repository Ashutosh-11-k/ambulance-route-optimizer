const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  emergencyPriority: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
