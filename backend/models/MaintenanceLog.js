const mongoose = require("mongoose");
const { MAINTENANCE_STATUS } = require("../utils/constants");

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    maintenance_type: { type: String, trim: true, maxlength: 100 },

    description: { type: String, trim: true },

    cost: { type: Number, default: 0, min: 0 },

    start_date: { type: Date, required: true },

    end_date: { type: Date, default: null },

    status: {
      type: String,
      enum: MAINTENANCE_STATUS,
      default: "Active",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

maintenanceLogSchema.index({ vehicle_id: 1 });
maintenanceLogSchema.index({ status: 1 });

maintenanceLogSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("MaintenanceLog", maintenanceLogSchema);
