import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router";

//Components
import { Header } from './Components/Header.jsx';

//Pages
import { Inicio } from './Pages/Inicio.jsx'
import { Login } from './Pages/Login.jsx'
import { Catalogo } from './Pages/Catalogo.jsx'
import { DetalleEquipo } from './Pages/DetalleEquipo.jsx';

export default function App() {

  return (
    <Router >
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
        <Header /><div className="w-full flex justify-center">
          <Routes >
            <Route path="/" element={<Inicio />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Catalogo" element={<Catalogo />} />
            <Route path="/equipo/:id" element={<DetalleEquipo />} />
            <Route path="/aula/:id" element={<DetalleEquipo />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

