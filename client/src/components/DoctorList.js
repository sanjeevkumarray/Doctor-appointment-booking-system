import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { getDoctors } from "../services/api";
import { toast } from "react-toastify";
import { Stethoscope } from "lucide-react";
import "./DoctorList.css";

const DoctorList = () => {
  const { doctors, setDoctors, setLoading, setError } = useAppContext();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await getDoctors();
        setDoctors(response.data);
      } catch (error) {
        setError("Failed to fetch doctors");
        toast.error("Failed to fetch doctors");
      }
      setLoading(false);
    };

    fetchDoctors();
  }, [setDoctors, setLoading, setError]);

  return (
    <div className="doctors_list_container">
      <div className="doctors_list_header">
        <h1 className="doctors_list_page-title">
          Our Prenatal Care Specialists
        </h1>
        <Stethoscope className="doctors_list_header-icon" />
      </div>
      <div className="doctors_list_doctors-grid">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="doctors_list_doctor-card">
            <div className="doctors_list_doctor-image-container">
              <img
                src={
                  doctor.image_url ||
                  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=500"
                }
                alt={doctor.name}
                className="doctors_list_doctor-image"
              />
            </div>
            <div className="doctors_list_doctor-info">
              <h2 className="doctors_list_doctor-name">{doctor.name}</h2>
              <p className="doctors_list_doctor-specialization">
                {doctor.specialization}
              </p>
              <p className="doctors_list_doctor-hours">
                Working hours: {doctor.working_hours.start} -{" "}
                {doctor.working_hours.end}
              </p>
              <Link
                to={`/book/${doctor._id}`}
                className="doctors_list_book-button"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;
