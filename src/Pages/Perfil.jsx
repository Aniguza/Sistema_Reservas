import React from 'react'
import { useSelector } from 'react-redux';

export const Perfil = () => {
  const usuarios = useSelector(state => state.usuarios.items);
  const userEmail = localStorage.getItem('userEmail');
  
  const usuarioActual = usuarios.find(usuario => 
    usuario.correo === userEmail || usuario.email === userEmail
  );
  
  if (!usuarioActual) {
    return (
      <div>
        <h1>Perfil de Usuario</h1>
        <p>Cargando información del usuario...</p>
      </div>
    );
  }
  
  return (
    <div className='max-w-[1400px] w-full px-5 font-lato'>
        <h1>Perfil de Usuario</h1>
        {/* Mostrar información del usuario actual */}

        <ul>
            <li><strong>Nombre:</strong> {usuarioActual.nombre || usuarioActual.name}</li>
            <li><strong>Email:</strong> {usuarioActual.correo || usuarioActual.email}</li>
            <li><strong>Rol:</strong> {usuarioActual.rol || usuarioActual.role}</li>
            {usuarioActual.codigo && <li><strong>Código:</strong> {usuarioActual.codigo}</li>}
            {usuarioActual.telefono && <li><strong>Teléfono:</strong> {usuarioActual.telefono}</li>}
            {/* Agrega más campos según la estructura del usuario */}   
            
        </ul>
    </div>
  )
}
