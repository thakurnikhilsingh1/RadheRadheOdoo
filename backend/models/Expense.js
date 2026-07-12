const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    expense_type: { type: String, trim: true, maxlength: 100 },

    amount: { type: Number, required: true, min: 0 },

    date: { type: Date, default: Date.now },

    description: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

expenseSchema.index({ vehicle_id: 1 });

expenseSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Expense", expenseSchema);
