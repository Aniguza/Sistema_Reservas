import React from 'react'
import { Link } from 'react-router'

export const Menu = () => {
    return (
        <>
            <Link to="/">Inicio</Link>
            <Link to="/catalogo">Equipos</Link>
            <Link to="/reservas">Reservas</Link>
            <Link to="/ayuda">Ayuda</Link>
        </>
    )
}
