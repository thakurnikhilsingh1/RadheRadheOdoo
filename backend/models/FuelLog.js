const mongoose = require("mongoose");

const fuelLogSchema = new mongoose.Schema(
  {
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    liters: { type: Number, required: true, min: [0.01, "liters must be greater than 0"] },

    cost: { type: Number, required: true, min: 0 },

    date: { type: Date, default: Date.now },

    distance: { type: Number, min: 0 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

fuelLogSchema.index({ vehicle_id: 1 });

fuelLogSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("FuelLog", fuelLogSchema);
