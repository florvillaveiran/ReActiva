import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserDashboard from "./pages/UserDashboard";
import Admin from "./pages/Admin";
import Usuario from "./pages/Usuario";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserDashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="*" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
