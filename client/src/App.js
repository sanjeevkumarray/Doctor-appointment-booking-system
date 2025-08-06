import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import DoctorList from "./components/DoctorList";
import AppointmentBooking from "./components/AppointmentBooking";
import AppointmentManagement from "./components/AppointmentManagement";

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<DoctorList />} />
            <Route path="/book/:doctorId" element={<AppointmentBooking />} />
            <Route path="/appointments" element={<AppointmentManagement />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
