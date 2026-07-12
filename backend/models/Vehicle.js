const mongoose = require("mongoose");
const { VEHICLE_STATUS } = require("../utils/constants");

const vehicleSchema = new mongoose.Schema(
  {
    registration_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },

    vehicle_name: { type: String, trim: true, maxlength: 100 },

    vehicle_type: { type: String, trim: true, maxlength: 50 },

    max_load_capacity: {
      type: Number,
      required: true,
      min: [0.01, "max_load_capacity must be greater than 0"],
    },

    odometer: { type: Number, default: 0, min: 0 },

    acquisition_cost: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: VEHICLE_STATUS,
      default: "Available",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

vehicleSchema.index({ status: 1 });

vehicleSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
