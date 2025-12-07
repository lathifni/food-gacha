// models/Food.js
import { Schema, model, models } from "mongoose";

const FoodSchema = new Schema(
  {
    name: { type: String, required: true },
    category: String,
    tags: [String],
    weight: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Food = models.Food || model("Food", FoodSchema);
