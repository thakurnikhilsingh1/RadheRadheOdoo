const mongoose = require("mongoose");
const { TRIP_STATUS } = require("../utils/constants");

const tripSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, trim: true, maxlength: 100 },

    destination: { type: String, required: true, trim: true, maxlength: 100 },

    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    cargo_weight: {
      type: Number,
      required: true,
      min: [0.01, "cargo_weight must be greater than 0"],
    },

    planned_distance: {
      type: Number,
      min: [0.01, "planned_distance must be greater than 0"],
    },

    status: {
      type: String,
      enum: TRIP_STATUS,
      default: "Draft",
    },

    dispatched_at: { type: Date, default: null },
    completed_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },
    final_odometer: { type: Number, default: null },
    fuel_consumed_liters: { type: Number, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

tripSchema.index({ status: 1 });
tripSchema.index({ vehicle_id: 1 });
tripSchema.index({ driver_id: 1 });

tripSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Trip", tripSchema);
