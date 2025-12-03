import { Suspense, lazy } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router";

//Components
import { Header } from './Components/Header.jsx';
import { ToastProvider } from './Context/ToastContext.jsx';
import { PerformanceMonitor } from './utils/performance.jsx';
import { DataLoader } from './Components/DataLoader.jsx';

//Pages - Lazy Loading para reducir el bundle inicial
const Inicio = lazy(() => import('./Pages/Inicio.jsx').then(module => ({ default: module.Inicio })));
const Login = lazy(() => import('./Pages/Login.jsx').then(module => ({ default: module.Login })));
const Catalogo = lazy(() => import('./Pages/Catalogo.jsx').then(module => ({ default: module.Catalogo })));
const DetalleEquipo = lazy(() => import('./Pages/DetalleEquipo.jsx').then(module => ({ default: module.DetalleEquipo })));
const ReservaForm = lazy(() => import('./Pages/ReservaForm.jsx').then(module => ({ default: module.ReservaForm })));
const Perfil = lazy(() => import('./Pages/Perfil.jsx').then(module => ({ default: module.Perfil })));

// Componente de carga mientras se cargan las páginas
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primario"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

export default function App() {

  return (
    <ToastProvider>
      <DataLoader />
      <PerformanceMonitor />
      <Router >
        <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
          <Header />
          <div className="w-full flex justify-center">
            <Suspense fallback={<LoadingFallback />}>
              <Routes >
                <Route path="/" element={<Inicio />} />
                <Route path="/login" element={<Login />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/equipo/:id" element={<DetalleEquipo />} />
                <Route path="/aula/:id" element={<DetalleEquipo />} />
                <Route path="/reservas" element={<ReservaForm />} />
                <Route path="/perfil" element={<Perfil />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
}

