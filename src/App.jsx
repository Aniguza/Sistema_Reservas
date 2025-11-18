import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router";

//Components
import { Header } from './Components/Header.jsx';
import { ToastProvider } from './Context/ToastContext.jsx';
import { ToastContainer } from './Components/toast.jsx';

//Pages
import { Inicio } from './Pages/Inicio.jsx'
import { Login } from './Pages/Login.jsx'
import { Catalogo } from './Pages/Catalogo.jsx'
import { DetalleEquipo } from './Pages/DetalleEquipo.jsx';
import { ReservaForm } from './Pages/ReservaForm.jsx';

export default function App() {

  return (
    <ToastProvider>
      <Router >
        <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
          <Header />
          <div className="w-full flex justify-center">
            <Routes >
              <Route path="/" element={<Inicio />} />
              <Route path="/login" element={<Login />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/equipo/:id" element={<DetalleEquipo />} />
              <Route path="/aula/:id" element={<DetalleEquipo />} />
              <Route path="/reservas" element={<ReservaForm />} />
            </Routes>
          </div>
        </div>
        {/* Contenedor de toasts global */}
        <ToastContainer />
      </Router>
    </ToastProvider>
  );
}

