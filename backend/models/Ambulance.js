const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema(
  {
    ambulanceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    currentLocation: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Ambulance", ambulanceSchema);
