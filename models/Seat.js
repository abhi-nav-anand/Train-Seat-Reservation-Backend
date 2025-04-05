import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  seatNumber: Number,
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
});

export default mongoose.model("Seat", seatSchema);