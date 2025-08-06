const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const {
  parseISO,
  setHours,
  setMinutes,
  addMinutes,
  format,
  isWithinInterval,
} = require("date-fns");

router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/slots", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const date = parseISO(req.query.date);
    const startTime = setMinutes(
      setHours(date, Number.parseInt(doctor.working_hours.start.split(":")[0])),
      Number.parseInt(doctor.working_hours.start.split(":")[1])
    );
    const endTime = setMinutes(
      setHours(date, Number.parseInt(doctor.working_hours.end.split(":")[0])),
      Number.parseInt(doctor.working_hours.end.split(":")[1])
    );

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      date: {
        $gte: startTime,
        $lt: endTime,
      },
    });

    const slots = [];
    let currentSlot = startTime;

    while (currentSlot < endTime) {
      const slotEnd = addMinutes(currentSlot, 30);
      const isBooked = appointments.some(
        (appointment) =>
          isWithinInterval(currentSlot, {
            start: appointment.date,
            end: addMinutes(appointment.date, appointment.duration),
          }) ||
          isWithinInterval(slotEnd, {
            start: appointment.date,
            end: addMinutes(appointment.date, appointment.duration),
          })
      );

      if (!isBooked) {
        slots.push(format(currentSlot, "HH:mm"));
      }

      currentSlot = slotEnd;
    }

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
