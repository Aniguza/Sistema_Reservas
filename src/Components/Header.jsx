import React from 'react'
import { Link } from 'react-router'
import { Menu } from './Menu.jsx';
import { GiHamburgerMenu } from "react-icons/gi";

export const Header = () => {
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
                <a className="btn btn-ghost text-xl">UTP+ Lab</a>
            </div>
            <div className="navbar-center hidden lg:flex">
                <div className="menu menu-horizontal px-1 flex gap-4">
                    <Menu />
                </div>
            </div>
            <div className="navbar-end ">
                <Link className="btn bg-baseRojo text-primario border-none hover:bg-[#fff]" to="/login"> INICIAR SESION </Link>
            </div>
        </div>
    )
}
