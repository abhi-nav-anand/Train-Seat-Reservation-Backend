import express from "express";
import { cancelBookedSeat, getSeats, listAllBookings, reserveSeats } from "../controllers/seatController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSeats);
router.post("/reserve", auth, reserveSeats);
router.post('/cancel', auth, cancelBookedSeat);
router.get('/bookings', auth, listAllBookings);
export default router;

