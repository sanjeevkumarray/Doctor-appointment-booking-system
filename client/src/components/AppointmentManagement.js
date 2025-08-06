import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { FaEdit, FaTrash, FaSpinner, FaClock } from "react-icons/fa";
import io from "socket.io-client";
import {
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getDoctorSlots,
} from "../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AppointmentManagement.css";

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    const socket = io(
      "https://appointment-booking-system-backend.onrender.com"
    );

    socket.on("appointmentUpdated", fetchAppointments);
    socket.on("appointmentCancelled", fetchAppointments);
    socket.on("appointmentBooked", fetchAppointments);

    fetchAppointments();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (editingAppointment && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, editingAppointment]);

  const fetchAvailableSlots = async () => {
    try {
      if (!editingAppointment || !selectedDate) return;

      const doctorId =
        typeof editingAppointment.doctorId === "object"
          ? editingAppointment.doctorId._id
          : editingAppointment.doctorId;

      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const response = await getDoctorSlots(doctorId, formattedDate);
      setAvailableSlots(response.data);

      // If current appointment time is on the same day, include it in available slots
      const currentAppointmentDate = parseISO(editingAppointment.originalDate);
      if (format(currentAppointmentDate, "yyyy-MM-dd") === formattedDate) {
        const timeSlot = format(currentAppointmentDate, "HH:mm");
        if (!response.data.includes(timeSlot)) {
          setAvailableSlots((prev) => [...prev, timeSlot].sort());
        }
      }

      // Clear selected slot if it's not in available slots
      if (selectedSlot && !response.data.includes(selectedSlot)) {
        setSelectedSlot("");
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Failed to fetch available time slots");
    }
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await getAppointments();
      // Sort appointments by date (most recent first)
      const sortedAppointments = response.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setAppointments(sortedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    const appointmentDate = parseISO(appointment.date);
    setSelectedDate(appointmentDate);
    setSelectedSlot(format(appointmentDate, "HH:mm"));

    setEditingAppointment({
      ...appointment,
      originalDate: appointment.date,
      date: format(appointmentDate, "yyyy-MM-dd'T'HH:mm"),
    });
  };

  const handleCancelEdit = () => {
    setEditingAppointment(null);
    setSelectedDate(null);
    setSelectedSlot("");
    setAvailableSlots([]);
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    try {
      setIsUpdating(true);

      // Create a date from selected date and time slot
      const localDateStr = `${format(
        selectedDate,
        "yyyy-MM-dd"
      )}T${selectedSlot}:00`;
      const appointmentDate = new Date(localDateStr);

      // Make sure we have the correct ID format
      const doctorId =
        typeof editingAppointment.doctorId === "object"
          ? editingAppointment.doctorId._id
          : editingAppointment.doctorId;

      // Create a clean update object
      const updateData = {
        doctorId,
        date: appointmentDate.toISOString(),
        duration: 30,
        appointmentType: editingAppointment.appointmentType,
        patientName: editingAppointment.patientName || "Patient", // Ensure this is never empty
        notes: editingAppointment.notes || "",
      };

      await updateAppointment(editingAppointment._id, updateData);

      toast.success("Appointment updated successfully");
      setEditingAppointment(null);
      setSelectedDate(null);
      setSelectedSlot("");
      setAvailableSlots([]);
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update appointment";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        setIsDeleting(true);

        await deleteAppointment(id);

        toast.success("Appointment cancelled successfully");
        fetchAppointments();
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        toast.error("Failed to cancel appointment");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setEditingAppointment({
      ...editingAppointment,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot("");
  };

  if (isLoading && appointments.length === 0) {
    return (
      <div className="container">
        <h1 className="page-title">My Appointments</h1>
        <div className="loading-message">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">My Appointments</h1>
      {appointments.length === 0 ? (
        <p className="no-appointments">No appointments scheduled.</p>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              {editingAppointment &&
              editingAppointment._id === appointment._id ? (
                <form onSubmit={handleUpdateAppointment}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="date">
                      Date
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      minDate={new Date()}
                      className="form-input"
                      dateFormat="MMMM d, yyyy"
                      id="date"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FaClock className="update-input-icon" />
                      Available Time Slots
                    </label>
                    <div className="update-time-slots-grid">
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`update-time-slot ${
                              selectedSlot === slot ? "selected" : ""
                            }`}
                          >
                            {slot}
                          </button>
                        ))
                      ) : (
                        <p className="update-no-slots-message">
                          No available slots for this date
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="appointmentType">
                      Appointment Type
                    </label>
                    <select
                      id="appointmentType"
                      name="appointmentType"
                      value={editingAppointment.appointmentType}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="Routine Check-Up">Routine Check-Up</option>
                      <option value="Ultrasound">Ultrasound</option>
                      <option value="Prenatal Testing">Prenatal Testing</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={editingAppointment.notes}
                      onChange={handleInputChange}
                      className="form-input"
                    ></textarea>
                  </div>
                  <div className="button-container">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="cancel-button"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="update-button"
                      disabled={isUpdating || !selectedSlot}
                    >
                      {isUpdating ? (
                        <>
                          <FaSpinner className="button-icon spinning" />
                          Updating...
                        </>
                      ) : (
                        "Update Appointment"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className="appointment-title">
                    Appointment with {appointment.doctorId.name}
                  </h2>
                  <p className="appointment-detail">
                    <strong>Date:</strong>{" "}
                    {format(parseISO(appointment.date), "MMMM d, yyyy h:mm a")}
                  </p>
                  <p className="appointment-detail">
                    <strong>Type:</strong> {appointment.appointmentType}
                  </p>
                  <p className="appointment-detail">
                    <strong>Patient:</strong> {appointment.patientName}
                  </p>
                  {appointment.notes && (
                    <p className="appointment-notes">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  )}
                  <div className="button-container">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="edit-button"
                      disabled={isDeleting}
                    >
                      <FaEdit className="button-icon" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      className="delete-button"
                      disabled={isDeleting}
                    >
                      <FaTrash className="button-icon" />
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
