import React from 'react'
import { Link } from 'react-router'

export const Menu = () => {
    const handleMenuClick = () => {
        // Cerrar el drawer en móvil
        const drawerCheckbox = document.getElementById('my-drawer-3');
        if (drawerCheckbox) {
            drawerCheckbox.checked = false;
        }
    };

    return (
        <>
            <Link to="/" className="menuItem" onClick={handleMenuClick}>Inicio</Link>
            <Link to="/catalogo" className="menuItem" onClick={handleMenuClick}> Equipos</Link>
            <Link to="/reservas" className="menuItem" onClick={handleMenuClick}>Reservar</Link>
        </>
    )
}
