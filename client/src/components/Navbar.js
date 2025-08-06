// Navbar.js
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaUserMd } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          CareTrack
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <FaUserMd className="link-icon" />
            <span>Doctors</span>
          </Link>
          <Link to="/appointments" className="nav-link">
            <FaCalendarAlt className="link-icon" />
            <span>My Appointments</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
