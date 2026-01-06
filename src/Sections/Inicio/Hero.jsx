import React from 'react'
import imgHero from '../../assets/Images/fondoHero.png'

export const Hero = () => {
    return (
        <div
            className="hero min-h-screen font-lato w-full"
            style={{
                backgroundImage:
                    `url(${imgHero})`,
            }}
        >
            <div className="hero-overlay"></div>
            <div className="hero-content text-neutral-content text-center px-4">
                <div className="max-w-4xl">
                    <h1 className="mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[90px] font-bold leading-tight">
                        RESERVA DE EQUIPOS DE LABORATORIO
                    </h1>
                    <p className="mb-5 text-base sm:text-lg md:text-xl lg:text-2xl px-4">
                        Accede a equipos de los laboratorios especializados para tus proyectos e investigaciones
                    </p>
                    <button className="btn bg-primario text-blanco shadow-none border-none mt-6 sm:mt-8 lg:mt-10 p-4 sm:p-5 lg:p-6 text-sm sm:text-base">
                        EXPLORAR EQUIPOS
                    </button>
                </div>
            </div>
        </div>
    )
}
