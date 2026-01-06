import React from 'react'
import { FaSearch } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";

export const CardsProceso = () => {
    const equipos = [
        {
            id: 1,
            nombre: "Busca y Selecciona",
            descripcion: "Encuentra el equipo que necesitas utilizando filtros avanzados y descripciones detalladas",
            icon: FaSearch,
        },
        {
            id: 2,
            nombre: "Reserva tu equipo",
            descripcion: "Elige las fechas y horas que mejor se adapten a tu horario y reserva con facilidad",
            icon: FaCalendarAlt ,
        },
        {
            id: 3,
            nombre: "Confirma y utiliza",
            descripcion: "Encuentra el equipo que necesitas utilizando filtros avanzados y descripciones detalladas",
            icon: FaCheckCircle,
        }
    ];

    return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center w-full max-w-6xl mx-auto">
                {equipos.map((equipo) => (
                    <div key={equipo.id} className="flex flex-col items-center card w-full max-w-sm sm:max-w-md lg:max-w-80 bg-[#f4f2f0] rounded-[15px] p-4 sm:p-5 shadow-md">
                        <figure className="max-w-fit bg-gray-300 p-3 sm:p-4 rounded-full mt-3">
                            {equipo.icon && <equipo.icon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-primario " />}
                        </figure>
                        <div className="card-body items-center text-center p-4">
                            <h2 className="card-title text-lg sm:text-xl">{equipo.nombre}</h2>
                            <p className="text-sm sm:text-base">{equipo.descripcion}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
  )
}
