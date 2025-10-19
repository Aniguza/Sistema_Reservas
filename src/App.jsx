import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router";

//Components
import { Header } from './Components/Header.jsx';

//Pages
import { Inicio } from './Pages/Inicio.jsx'


export default function App() {

  return (
    <Router >
      <Header />
      <Routes >
        <Route path="/" element={<Inicio />} />
      </Routes>
    </Router>
  );
}

