import React from 'react'
import { Link, useNavigate } from 'react-router'
import { Menu } from './Menu.jsx';
import { GiHamburgerMenu } from "react-icons/gi";


export const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('token');
        navigate('/login');
        window.location.reload(); // Para actualizar el estado del header
    };

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    return (
        <div className="navbar text-negro font-lato">
            <div className="navbar-start">
                <div className="dropdown">
                    <div className="drawer-content flex flex-col items-center justify-center">
                        {/* Page content here */}
                        <label htmlFor="my-drawer-3" className="btn drawer-button lg:hidden">
                            <GiHamburgerMenu className="h-5 w-5" />
                        </label>
                    </div>
                    {/* <div className="drawer lg:drawer-open" tabIndex="-1">
                        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
                        
                        <div className="drawer-side">
                            <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
                            <ul className="menu bg-base-200 min-h-full w-80 p-4">
                                {/* Sidebar content here 
                                <li><a>Sidebar Item 1</a></li>
                                <li><a>Sidebar Item 2</a></li>
                            </ul>
                        </div>
                    </div> */}
                </div>
                <Link to="/" className="btn btn-ghost text-xl">UTP+ Lab</Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <div className="menu menu-horizontal px-1 flex gap-4">
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
                                        <span className="text-xl font-bold">{localStorage.getItem('userEmail') ? localStorage.getItem('userEmail').charAt(0).toUpperCase() : 'U'}</span>

                                </div>
                                <ul
                                    tabIndex="-1"
                                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                                    <li>
                                        <Link
                                            to='/perfil'
                                            className="btn justify-start border-none hover:bg-[#fff]"
                                        >
                                            Perfil
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
