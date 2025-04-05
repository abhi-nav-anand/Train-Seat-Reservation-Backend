import Seat from "../models/Seat.js";

export const getSeats = async (req, res) => {
  try {
    const insertSeats = async () => {
      try {

        const seats = Array.from({ length: 80 }, (_, index) => ({
          seatNumber: index + 1, 
          bookedBy: null,         
        }));

        const result = await Seat.insertMany(seats);
      } catch (error) {
        console.error('Error inserting seats:', error);
      }
    };
    const seatsAvailable = await Seat.find();
    seatsAvailable.length <=0 && insertSeats();
    const seats = await Seat.find().sort("seatNumber");
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch seats" });
  }
};

export const reserveSeats = async (req, res) => {
  try {
    const { count } = req.body;
    const userId = req.user.userId;

    if (count > 7) {
      return res.status(400).json({ error: "Cannot book more than 7 seats at once" });
    }

    const allSeats = await Seat.find().sort("seatNumber");
    const availableSeats = allSeats.filter((seat) => !seat.bookedBy);

    if (availableSeats.length < count) {
      return res.status(400).json({ error: "Not enough seats available" });
    }

    const seatMap = Array(80).fill(null);
    allSeats.forEach((seat) => {
      seatMap[seat.seatNumber - 1] = seat.bookedBy ? 1 : 0;
    });

    let bestMatch = [];
    for (let row = 0; row < 11; row++) {
      const rowStart = row * 7;
      const rowEnd = row === 10 ? 80 : rowStart + 7;
      const rowSeats = seatMap.slice(rowStart, rowEnd);

      for (let i = 0; i <= rowSeats.length - count; i++) {
        if (rowSeats.slice(i, i + count).every((s) => s === 0)) {
          bestMatch = Array.from({ length: count }, (_, idx) => rowStart + i + idx + 1);
          break;
        }
      }
      if (bestMatch.length) break;
    }

    if (bestMatch.length === 0) {
      bestMatch = availableSeats.slice(0, count).map((seat) => seat.seatNumber);
    }

    const updatedSeats = await Seat.updateMany(
      { seatNumber: { $in: bestMatch } },
      { $set: { bookedBy: userId } }
    );

    res.status(200).json({ message: "Seats reserved", seats: bestMatch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reserve seats" });
  }
};

export const cancelBookedSeat = async (req, res) => {
  const { seatNumber } = req.body; 
  const userId = req.user.userId; 

  try {
    const seat = await Seat.findOne({ seatNumber });
    
    if (!seat) {
      return res.status(404).json({ error: "Seat not found" });
    }

    if (seat.bookedBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You cannot cancel a seat that is not booked by you" });
    }

    seat.bookedBy = null;
    await seat.save();

    return res.status(200).json({ message: "Seat booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling seat:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const listAllBookings = async (req, res) => {
  const userId = req.user.userId;

  try {
   
    const bookedSeats = await Seat.find({ bookedBy: userId });

    if (bookedSeats.length === 0) {
      return res.status(404).json({ message: "No bookings found for this user" });
    }
    const bookedSeatsFiltered = bookedSeats.filter(seat => seat.bookedBy !== null && seat.bookedBy !== undefined);

    if (bookedSeatsFiltered.length === 0) {
      return res.status(404).json({ message: "No valid bookings found for this user" });
    }

    return res.status(200).json(bookedSeatsFiltered);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

