const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { parseISO, addMinutes } = require("date-fns");

router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("doctorId");
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "doctorId"
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { doctorId, date, duration, appointmentType, patientName, notes } =
      req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointmentDate = parseISO(date);
    const appointmentEnd = addMinutes(appointmentDate, duration);

    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      date: {
        $lt: appointmentEnd,
        $gte: appointmentDate,
      },
    });

    if (conflictingAppointment) {
      return res
        .status(400)
        .json({ message: "This time slot is not available" });
    }

    const newAppointment = new Appointment({
      doctorId,
      date: appointmentDate,
      duration,
      appointmentType,
      patientName,
      notes,
    });

    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { doctorId, date, duration, appointmentType, patientName, notes } =
      req.body;
    const appointmentDate = parseISO(date);
    const appointmentEnd = addMinutes(appointmentDate, duration);

    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      doctorId,
      date: {
        $lt: appointmentEnd,
        $gte: appointmentDate,
      },
    });

    if (conflictingAppointment) {
      return res
        .status(400)
        .json({ message: "This time slot is not available" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        doctorId,
        date: appointmentDate,
        duration,
        appointmentType,
        patientName,
        notes,
      },
      { new: true }
    ).populate("doctorId");

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
