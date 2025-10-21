import React from 'react'
import '../App.css'

export const Login = () => {
  return (
    <div className="login-container">
      <fieldset className="login-card">
        <h1 className="login-title">¡BIENVENIDO A LAB RESERVE DE UTP!</h1>

        <p className="login-subtitle">
          Inicie sesión para administrar sus reservas de equipos de laboratorio
        </p>

        <form className="login-form">
          <input
            type="email"
            className="login-input top"
            placeholder="Correo institucional"
          />
          <input
            type="password"
            className="login-input bottom"
            placeholder="Contraseña"
          />

          <button className="login-button">Iniciar sesión</button>
        </form>
        <p className="login-footer">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="login-register-link">
            Regístrate
          </a>
        </p>
      </fieldset>
    </div>
  );
};