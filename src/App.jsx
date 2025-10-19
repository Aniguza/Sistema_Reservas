import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router";

//Components
import { Header } from './Components/Header.jsx';

//Pages
import { Inicio } from './Pages/Inicio.jsx'
import { Login } from './Pages/Login.jsx'

export default function App() {

  return (
    <Router >
      <Header />
      <Routes >
        <Route path="/" element={<Inicio />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </Router>
  );
}

