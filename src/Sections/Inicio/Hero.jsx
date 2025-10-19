import React from 'react'
import imgHero from '../../assets/Images/fondoHero.png'

export const Hero = () => {
    return (
        <div
            className="hero min-h-screen font-lato"
            style={{
                backgroundImage:
                    `url(${imgHero})`,
            }}
        >
            <div className="hero-overlay"></div>
            <div className="hero-content text-neutral-content text-center">
                <div className="max-w-xxl">
                    <h1 className="mb-5 text-[90px] font-bold">RESERVA DE EQUIPOS DE LABORATORIO</h1>
                    <p className="mb-5 text-2xl">
                        Accede a equipos de los laboratorios especializados para tus proyectos e investigaciones
                    </p>
                    <button className="btn bg-primario text-blanco shadow-none border-none mt-10 p-6">EXPLORAR EQUIPOS</button>
                </div>
            </div>
        </div>
    )
}
