const mongoose = require("mongoose");
const { DRIVER_STATUS } = require("../utils/constants");

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },

    license_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },

    license_category: { type: String, trim: true, maxlength: 50 },

    license_expiry_date: { type: Date, required: true },

    contact_number: { type: String, trim: true, maxlength: 20 },

    safety_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: DRIVER_STATUS,
      default: "Available",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

driverSchema.index({ status: 1 });

driverSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Driver", driverSchema);
