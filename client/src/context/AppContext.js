"use client";

import { createContext, useState, useContext } from "react";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    doctors,
    setDoctors,
    appointments,
    setAppointments,
    loading,
    setLoading,
    error,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
