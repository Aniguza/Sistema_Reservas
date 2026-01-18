import React from 'react'
import { Link, useNavigate } from 'react-router'
import { Menu } from './Menu.jsx';
import { GiHamburgerMenu } from "react-icons/gi";
import { HiX } from "react-icons/hi";
import { useSelector } from 'react-redux';


export const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        navigate('/login');
        window.location.reload(); // Para actualizar el estado del header
    };

    const { user: usuarioActual, isLoading } = useSelector(state => state.auth);
    const isLoggedIn = !!localStorage.getItem('access_token');

    return (
        <div className="flex navbar text-negro font-lato max-w-[1400px] justify-center mx-auto">
            <div className="navbar-start">
                <div className="dropdown lg:hidden">
                    <div className="drawer-content flex flex-col items-center justify-center">
                        {/* Page content here */}
                        <label htmlFor="my-drawer-3" className="btn drawer-button lg:hidden">
                            <GiHamburgerMenu className="h-5 w-5" />
                        </label>
                    </div>
                    <div className="drawer lg:drawer-open" tabIndex="-1">
                        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

                        <div className="drawer-side z-50">
                            <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay bg-black/50"></label>
                            <div className="bg-white min-h-full w-72 flex flex-col shadow-2xl">
                                {/* Header del menú móvil */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg text-primario">Menú</span>
                                    </div>
                                    <label 
                                        htmlFor="my-drawer-3" 
                                        className="btn btn-ghost btn-sm btn-circle hover:bg-baseRojo"
                                    >
                                        <HiX className="h-5 w-5" />
                                    </label>
                                </div>
                                
                                {/* Contenido del menú */}
                                <div className="flex-1 p-4">
                                    <Menu isMobile={true} />
                                </div>

                                {/* Footer del menú móvil */}
                                <div className="p-4 border-t border-gray-100">
                                    {isLoggedIn ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3 p-2 bg-baseGris rounded-lg">
                                                <div className="w-10 h-10 rounded-full bg-primario text-white flex items-center justify-center font-bold">
                                                    {(() => {
                                                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                        if (user.correo) return user.correo.charAt(0).toUpperCase();
                                                        return 'U';
                                                    })()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm">
                                                        {(() => {
                                                            // Primero intentar de Redux, luego de localStorage
                                                            if (usuarioActual?.nombre) return usuarioActual.nombre.split(' ')[0];
                                                            if (usuarioActual?.name) return usuarioActual.name.split(' ')[0];
                                                            const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                            if (user.nombre) return user.nombre.split(' ')[0];
                                                            if (user.name) return user.name.split(' ')[0];
                                                            return 'Usuario';
                                                        })()}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {(() => {
                                                            const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                            return user.correo || '';
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link 
                                                    to="/perfil" 
                                                    className="flex-1 btn btn-sm bg-baseGris border-none hover:bg-gray-200"
                                                    onClick={() => {
                                                        const drawerCheckbox = document.getElementById('my-drawer-3');
                                                        if (drawerCheckbox) drawerCheckbox.checked = false;
                                                    }}
                                                >
                                                    Perfil
                                                </Link>
                                                <Link 
                                                    to="/mis-reservas" 
                                                    className="flex-1 btn btn-sm bg-baseGris border-none hover:bg-gray-200"
                                                    onClick={() => {
                                                        const drawerCheckbox = document.getElementById('my-drawer-3');
                                                        if (drawerCheckbox) drawerCheckbox.checked = false;
                                                    }}
                                                >
                                                    Reservas
                                                </Link>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    handleLogout();
                                                    const drawerCheckbox = document.getElementById('my-drawer-3');
                                                    if (drawerCheckbox) drawerCheckbox.checked = false;
                                                }}
                                                className="btn btn-sm bg-primario text-white border-none hover:bg-primario/90 w-full"
                                            >
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    ) : (
                                        <Link 
                                            to="/login" 
                                            className="btn bg-primario text-white border-none hover:bg-primario/90 w-full"
                                            onClick={() => {
                                                const drawerCheckbox = document.getElementById('my-drawer-3');
                                                if (drawerCheckbox) drawerCheckbox.checked = false;
                                            }}
                                        >
                                            Iniciar Sesión
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-50'>
                    <Link to="/" className="btn btn-ghost text-xl"> <img src="https://res.cloudinary.com/dtmuza6iw/image/upload/v1767589197/lab_htncpr.jpg" width="fill" alt="Logo" /></Link>
                </div>
            </div>
            <div className="navbar-center hidden lg:flex">
                <div className="menu menu-horizontal px-1 flex gap-10">
                    <Menu />
                </div>
            </div>
            <div className="navbar-end ">
                {isLoggedIn ? (
                    <>
                        <div className="flex gap-2">
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                    {/* // primera letra y primera letra del nombre y apellido */}
                                    <span className="text-xl font-bold">{(() => {
                                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                                        if (user.correo) return user.correo.charAt(0).toUpperCase();
                                        return 'U';
                                    })()}</span>

                                </div>
                                <ul
                                    tabIndex="-1"
                                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                                        <li className='p-3 justify-start border-none hover:bg-[#fff]'>
                                            Hola {(() => {
                                                if (usuarioActual?.nombre) return usuarioActual.nombre.split(' ')[0];
                                                if (usuarioActual?.name) return usuarioActual.name.split(' ')[0];
                                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                if (user.nombre) return user.nombre.split(' ')[0];
                                                if (user.name) return user.name.split(' ')[0];
                                                return 'Usuario';
                                            })()}
                                        </li>
                                    <li>
                                        <Link
                                            to='/perfil'
                                            className="btn justify-start border-none hover:bg-[#fff]"
                                        >
                                            Perfil
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to='/mis-reservas'
                                            className="btn justify-start border-none hover:bg-[#fff]"
                                        >
                                            Mis Reservas
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="btn justify-start h-8 bg-baseRojo text-primario border-none hover:bg-[#fff]"
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </>
                ) : (
                    <Link className="btn bg-baseRojo text-primario border-none hover:bg-[#fff]" to="/login">
                        INICIAR SESION
                    </Link>
                )}
            </div>
        </div>
    )
}