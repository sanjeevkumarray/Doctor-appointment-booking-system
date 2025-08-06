import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Briefcase as BriefcaseMedical,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDoctor, getDoctorSlots, createAppointment } from "../services/api";
import Modal from "./Modal";
import "./AppointmentBooking.css";

const AppointmentBooking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({
    patientName: "",
    appointmentType: "",
    notes: "",
  });

  useEffect(() => {
    fetchDoctorData();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchDoctorData = async () => {
    try {
      setIsLoading(true);
      const response = await getDoctor(doctorId);
      setDoctor(response.data);
    } catch (error) {
      toast.error("Failed to fetch doctor details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setIsLoading(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const response = await getDoctorSlots(doctorId, formattedDate);
      setAvailableSlots(response.data);
      if (selectedSlot && !response.data.includes(selectedSlot)) {
        setSelectedSlot("");
      }
    } catch (error) {
      toast.error("Failed to fetch available slots");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setAppointmentDetails({
      ...appointmentDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const validateForm = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return false;
    }
    if (!appointmentDetails.patientName.trim()) {
      toast.error("Please enter patient name");
      return false;
    }
    if (!appointmentDetails.appointmentType) {
      toast.error("Please select appointment type");
      return false;
    }
    return true;
  };

  const confirmAppointment = async () => {
    try {
      setIsLoading(true);
      const localDateStr = `${format(
        selectedDate,
        "yyyy-MM-dd"
      )}T${selectedSlot}:00`;

      await createAppointment({
        doctorId,
        date: new Date(localDateStr).toISOString(),
        duration: 30,
        appointmentType: appointmentDetails.appointmentType,
        patientName: appointmentDetails.patientName.trim(),
        notes: appointmentDetails.notes || "",
      });

      toast.success("Appointment booked successfully");
      navigate("/appointments");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to book appointment";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  if (isLoading && !doctor) {
    return <div className="loading-message">Loading...</div>;
  }

  if (!doctor) {
    return <div className="error-message">Doctor not found</div>;
  }

  return (
    <div className="booking-container">
      <h1 className="booking-title">Book an Appointment</h1>
      <p className="booking-subtitle">
        with Dr. {doctor.name}, {doctor.specialization}
      </p>

      <div className="booking-content">
        {/* Doctor Details Card */}
        <div className="doctor-details-card">
          <h2 className="section-title">Doctor Details</h2>
          <div className="doctor-image-container">
            <img
              src={
                doctor.image_url ||
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=500"
              }
              alt={doctor.name}
              className="doctor-image"
            />
          </div>
          <div className="doctor-info">
            <h3 className="doctor-name">Dr. {doctor.name}</h3>
            <p className="doctor-specialization">{doctor.specialization}</p>
            <div className="doctor-detail">
              <Clock className="detail-icon" />
              <span>
                {doctor.working_hours.start} - {doctor.working_hours.end}
              </span>
            </div>
            {/* <div className="doctor-detail">
              <BriefcaseMedical className="detail-icon" />
              <span>15 years experience</span>
            </div> */}
          </div>
        </div>

        {/* Booking Form Card */}
        <div className="booking-form-card">
          <h2 className="section-title">Book Your Appointment</h2>
          <p className="section-subtitle">
            Select a date and time for your appointment
          </p>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label className="form-label">
                <Calendar className="input-icon" />
                Select Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                minDate={new Date()}
                className="form-input date-input"
                dateFormat="MMMM d, yyyy"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock className="input-icon" />
                Available Time Slots
              </label>
              <div className="time-slots-grid">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`time-slot ${
                      selectedSlot === slot ? "selected" : ""
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="patientName">
                <User className="input-icon" />
                Patient Name
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={appointmentDetails.patientName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter patient name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="appointmentType">
                <FileText className="input-icon" />
                Appointment Type
              </label>
              <select
                id="appointmentType"
                name="appointmentType"
                value={appointmentDetails.appointmentType}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select appointment type</option>
                <option value="Routine Check-Up">Routine Check-Up</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="Prenatal Testing">Prenatal Testing</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">
                <FileText className="input-icon" />
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={appointmentDetails.notes}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Any additional information"
                rows="3"
              />
            </div>

            <button type="submit" className="book-button" disabled={isLoading}>
              <Calendar className="button-icon" />
              {isLoading ? "Booking..." : "Book Appointment"}
            </button>
          </form>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Appointment"
      >
        <div className="confirmation-content">
          <div className="confirmation-header">
            <img
              src={
                doctor.image_url ||
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=500"
              }
              alt={doctor.name}
              className="confirmation-doctor-image"
            />
            <div className="confirmation-doctor-info">
              <h3>Dr. {doctor.name}</h3>
              <p>{doctor.specialization}</p>
            </div>
          </div>

          <div className="confirmation-details">
            <div className="detail-item">
              <Calendar className="detail-icon" />
              <div>
                <strong>Date</strong>
                <p>{format(selectedDate, "MMMM d, yyyy")}</p>
              </div>
            </div>

            <div className="detail-item">
              <Clock className="detail-icon" />
              <div>
                <strong>Time</strong>
                <p>{selectedSlot}</p>
              </div>
            </div>

            <div className="detail-item">
              <User className="detail-icon" />
              <div>
                <strong>Patient</strong>
                <p>{appointmentDetails.patientName}</p>
              </div>
            </div>

            <div className="detail-item">
              <FileText className="detail-icon" />
              <div>
                <strong>Type</strong>
                <p>{appointmentDetails.appointmentType}</p>
              </div>
            </div>

            {appointmentDetails.notes && (
              <div className="detail-item">
                <FileText className="detail-icon" />
                <div>
                  <strong>Notes</strong>
                  <p>{appointmentDetails.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="confirmation-actions">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="cancel-button"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={confirmAppointment}
              className="confirm-button"
              disabled={isLoading}
            >
              {isLoading ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentBooking;
