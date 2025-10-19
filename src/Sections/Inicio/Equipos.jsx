import React from 'react'

export const Equipos = () => {
    // Array con los datos de los equipos
    const equipos = [
        {
            id: 1,
            nombre: "Kit Arduino",
            descripcion: "Ideal para prototipado rápido y proyectos electrónicos.",
            imagen: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
            alt: "Kit Arduino"
        },
        {
            id: 2,
            nombre: "Raspberry Pi",
            descripcion: "Computadora de placa única perfecta para proyectos IoT.",
            imagen: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
            alt: "Raspberry Pi"
        },
        {
            id: 3,
            nombre: "Kit Sensores",
            descripcion: "Conjunto completo de sensores para experimentación.",
            imagen: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
            alt: "Kit Sensores"
        }
    ];

    return (
        <div className="p-10 text-center">
            <h2 className="text-3xl font-bold mb-5">Equipos Disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {equipos.map((equipo) => (
                    <div key={equipo.id} className="card w-96 ">
                        <figure className="px-10 pt-10">
                            <img
                                src={equipo.imagen}
                                alt={equipo.alt}
                                className="rounded-xl" />
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
