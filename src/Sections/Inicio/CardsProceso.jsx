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
    <div className="p-10 text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 justify-items-center w-[80%] mx-auto">
                {equipos.map((equipo) => (
                    <div key={equipo.id} className="flex flex-col items-center card w-80 bg-[#f4f2f0] rounded-[15px] p-5 ">
                        <figure className="max-w-fit bg-gray-300 p-4 rounded-full mt-3">
                            {equipo.icon && <equipo.icon className="w-10 h-10 mx-auto text-primario " />}
                        </figure>
                        <div className="card-body items-center text-center">
                            <h2 className="card-title">{equipo.nombre}</h2>
                            <p>{equipo.descripcion}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
  )
}
