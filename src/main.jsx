import React, { useEffect } from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Layout from "./pages/Layout";
import SelectionsPage from "./pages/SelectionsPage";
import MapPage from "./pages/MapPage";
import NoPage from "./pages/NoPage";
import LoginPage from "./pages/LoginPage"; 

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={
              <ProtectedRoute>
                <SelectionsPage />
              </ProtectedRoute>
            } />
            <Route path="map" element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            } />

            <Route path="login" element={<LoginPage />} />
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
