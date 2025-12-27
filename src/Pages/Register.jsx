import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import '../App.css';
import { useToastActions } from '../Context/ToastContext.jsx';
import { usuariosService } from '../services/usuariosService.js';

export const Register = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastActions();

  const [formValues, setFormValues] = useState({
    correo: '',
    nombre: '',
    carrera: '',
    rol: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const trimmedCorreo = formValues.correo.trim();
    const trimmedNombre = formValues.nombre.trim();
    const trimmedCarrera = formValues.carrera.trim();
    const trimmedRol = formValues.rol.trim();
    const trimmedPassword = formValues.password.trim();

    if (!trimmedCorreo || !trimmedNombre || !trimmedCarrera || !trimmedRol || !trimmedPassword) {
      showError('Por favor completa todos los campos', 3000);
      return false;
    }

    if (!trimmedCorreo.includes('@utp.edu.pe')) {
      showError('Debes usar tu correo institucional (@utp.edu.pe)', 4000);
      return false;
    }

    if (trimmedPassword.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres', 4000);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await usuariosService.createUsuario({
        correo: formValues.correo.trim(),
        nombre: formValues.nombre.trim(),
        carrera: formValues.carrera.trim(),
        rol: formValues.rol,
        contraseña: formValues.password,
      });

      showSuccess('Registro completado correctamente', 4000);

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (error) {
      showError(error.message || 'No se pudo completar el registro', 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <fieldset className="login-card">
        <h1 className="login-title">Crea tu cuenta en Lab Reserve</h1>
        <p className="login-subtitle">Completa tus datos para gestionar tus reservas</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="login-input top"
            placeholder="Correo institucional (@utp.edu.pe)"
            name="correo"
            value={formValues.correo}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          <input
            type="text"
            className="login-input"
            placeholder="Nombre completo"
            name="nombre"
            value={formValues.nombre}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          <input
            type="text"
            className="login-input"
            placeholder="Carrera"
            name="carrera"
            value={formValues.carrera}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          <select
            className="login-input"
            name="rol"
            value={formValues.rol}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          >
            <option value="" disabled>Selecciona un rol</option>
            <option value="alumno">Alumno</option>
            <option value="docente">Docente</option>
          </select>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="login-input bottom"
              placeholder="Contraseña"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-4 cursor-pointer hover:text-primario transition-colors"
              disabled={isSubmitting}
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>

          <button
            type="submit"
            className={`login-button ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'} transition-all`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Registrando...
              </span>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        <p className="login-footer">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="login-register-link">
            Inicia sesión
          </Link>
        </p>
      </fieldset>
    </div>
  );
};
