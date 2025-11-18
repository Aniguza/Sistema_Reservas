import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router';
import '../App.css'

import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useToastActions } from '../Components/toast.jsx';


export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToastActions();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  //usuario de prueba
  //correo: usuario@utp.edu.pe
  //contraseña: 123456
  const handleLogin = async (event) => {
    event.preventDefault();
    
    // Validación de campos vacíos
    if (!email.trim() || !password.trim()) {
      showError("Por favor completa todos los campos", 3000);
      return;
    }

    // Validación de formato de email
    if (!email.includes('@utp.edu.pe')) {
      showError("Debes usar tu correo institucional (@utp.edu.pe)", 4000);
      return;
    }

    setIsLoading(true);

    // Simular delay de autenticación
    setTimeout(() => {
      if (email === "usuario@utp.edu.pe" && password === "123456") {
        showSuccess("¡Inicio de sesión exitoso! Bienvenido 🎉", 4000);
        
        // Guardar estado de login (opcional) en localStorage pero que no permita manipulación fácil
        Object.freeze(localStorage);
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        // Redirigir a inicio después de un breve delay
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        showError("Credenciales inválidas. Verifica tu correo y contraseña", 4000);
      }
      setIsLoading(false);
    }, 800);
  };
  return (


    <div className="login-container ">
      <fieldset className="login-card">
        <h1 className="login-title">¡BIENVENIDO A LAB RESERVE DE UTP!</h1>

        <p className="login-subtitle">
          Inicie sesión para administrar sus reservas de equipos de laboratorio
        </p>

        {/* Credenciales de prueba */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded">
          <p className="text-sm text-blue-700 font-medium">Credenciales de prueba:</p>
          <p className="text-xs text-blue-600">📧 usuario@utp.edu.pe</p>
          <p className="text-xs text-blue-600">🔐 123456</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            className="login-input top"
            placeholder="Correo institucional (@utp.edu.pe)"
            required
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input bottom"
              placeholder="Contraseña"
              required
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          
            <button 
              type="button" 
              onClick={togglePasswordVisibility} 
              className="absolute right-3 top-4 cursor-pointer hover:text-primario transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'} transition-all`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
        <p className="login-footer">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="login-register-link">
            Regístrate
          </Link>
        </p>
      </fieldset>
    </div>
  );
};