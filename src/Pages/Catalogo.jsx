import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FaSearch, FaChevronDown } from "react-icons/fa";
import { IoFilterSharp } from "react-icons/io5";
import { dataEquipos, dataAulas } from '../data/dataEquipos.jsx';
import foto from '../assets/Images/equipo.png';

export const Catalogo = () => {
    const navigate = useNavigate();

    const handleCardClick = (item) => {
        // Navegamos incluyendo el tipo de recurso en la URL
        if (item.tipo === 'Equipo') {
            navigate(`/equipo/${item.id}`);
        } else {
            navigate(`/aula/${item.id}`);
        }
    };

    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todos'); // Nuevo estado para filtrar por tipo
    const [filtroCategoria, setFiltroCategoria] = useState('Todos'); // Nuevo estado para filtrar por categoría
    const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('Todos'); // Nuevo estado para filtrar por disponibilidad
    const [filtroUbicacion, setFiltroUbicacion] = useState('Todos'); // Nuevo estado para filtrar por ubicación

    const handleSearch = (e) => {
        setBusqueda(e.target.value);
    };

    // Combinar aulas y equipos en un solo array
    const todosLosItems = [
        ...dataAulas.map(aula => ({ ...aula, tipo: 'Aula' })),
        ...dataEquipos.map(equipo => ({ ...equipo, tipo: 'Equipo' }))
    ];

    // Filtrar items en tiempo real basado en la búsqueda y tipo
    const itemsFiltrados = todosLosItems.filter(item => {
        // Filtro por tipo
        if (filtroTipo !== 'Todos' && item.tipo !== filtroTipo) {
            return false;
        }

        // Filtro por categoría
        if (filtroCategoria !== 'Todos' && item.categoria !== filtroCategoria) {
            return false;
        }

        // Filtro por disponibilidad
        if (filtroDisponibilidad !== 'Todos' && item.disponibilidad !== (filtroDisponibilidad === 'Disponible')) {
            return false;
        }

        // Filtro por ubicación
        if (filtroUbicacion !== 'Todos' && item.ubicacion !== filtroUbicacion) {
            return false;
        }

        // Si no hay búsqueda, mostrar todos (que pasen el filtro de tipo)
        if (!busqueda.trim()) return true;
        
        const terminoBusqueda = busqueda.toLowerCase().trim();
        
        // Búsqueda común para ambos tipos
        const coincideNombre = item.nombre.toLowerCase().includes(terminoBusqueda);
        const coincideDescripcion = item.descripcion.toLowerCase().includes(terminoBusqueda);
        const coincideUbicacion = item.ubicacion.toLowerCase().includes(terminoBusqueda);
        
        // Búsqueda específica para equipos
        if (item.tipo === 'Equipo' && item.especificaciones) {
            const coincideMarca = item.especificaciones.marca.toLowerCase().includes(terminoBusqueda);
            const coincideModelo = item.especificaciones.modelo.toLowerCase().includes(terminoBusqueda);
            const coincideCategoria = item.categoria.toLowerCase().includes(terminoBusqueda);
            return coincideNombre || coincideDescripcion || coincideUbicacion || coincideMarca || coincideModelo || coincideCategoria;
        }
        
        // Búsqueda para aulas
        return coincideNombre || coincideDescripcion || coincideUbicacion;
    });



    return (
        <section className='max-w-[1400px] w-full px-5 font-lato'>
            <div className='w-full'>
                <p className='titulos'>Catálogo de Recursos</p>
                <p className='parrafos'>Encuentra y reserva las aulas y equipos que necesitas para tus proyectos y clases.</p>
            </div>
            <div className='grid grid-cols-[1fr_auto] gap-3'>
                <label className="input bg-blanco border border-negro w-full">
                    <FaSearch className="icon text-primario w-4 h-4" />
                    <input type="search" required placeholder="Busca aulas y equipos por nombre, ubicación, marca..." className='w-full bg-white' value={busqueda} onChange={handleSearch} 
                         />
                </label>
                <button className="btn text-negro bg-blanco  border border-negro shadow-none">
                    <IoFilterSharp className="icon text-primario w-4 h-4" />
                    Filtros
                </button>
            </div>
            <div className='flex gap-3 mt-2'>
                <select 
                    value={filtroTipo} 
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="select"
                >
                    <option value="Todos">Todos los recursos</option>
                    <option value="Aula">Solo Aulas</option>
                    <option value="Equipo">Solo Equipos</option>
                </select>
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="select">
                    <option value="Todos">Categoría</option>
                    <option value="Electronico">Electrónicos</option>
                    <option value="Herramienta">Herramientas</option>
                    <option value="Tecnologico">Tecnológicos</option>
                </select>
                <select value={filtroDisponibilidad} onChange={(e) => setFiltroDisponibilidad(e.target.value)} className="select ">
                    <option value="Todos">Disponibilidad</option>
                    <option value="Disponible">Disponibles</option>
                    <option value="NoDisponible">No Disponibles</option>
                </select>
                <select value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)} className="select ">
                    <option value="Todos">Ubicación</option>
                    <option value="lab-303">Laboratorio 303</option>
                    <option value="lab-307">Laboratorio 307</option>
                    <option value="lab-313-1">Laboratorio de construcción digital</option>
                    <option value="lab-313-2">Laboratorio BIM</option>
                </select>

            </div>

            {/* Contador de resultados */}
            <div className="mt-4 mb-2">
                <p className="text-sm text-gray-600">
                    {busqueda.trim() ? (
                        <>Mostrando {itemsFiltrados.length} resultado{itemsFiltrados.length !== 1 ? 's' : ''} para "{busqueda}"</>
                    ) : (
                        <>Mostrando {itemsFiltrados.length} recurso{itemsFiltrados.length !== 1 ? 's' : ''} {filtroTipo !== 'Todos' ? filtroTipo.toLowerCase() + (itemsFiltrados.length !== 1 ? 's' : '') : 'disponible' + (itemsFiltrados.length !== 1 ? 's' : '')}</>
                    )}
                </p>
            </div>

            <div className='mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-10'>
                {itemsFiltrados.length > 0 ? (
                    itemsFiltrados.map((item) => (
                        <div
                            className="card bg-baseGris w-full max-w-60 shadow-sm cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-white border-2 border-transparent hover:border-primario group"
                            key={`${item.tipo}-${item.id}`}
                            onClick={() => handleCardClick(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleCardClick(item);
                                }
                            }}
                        >
                            <figure className="relative overflow-hidden">
                                <img
                                    src={item.imagen || foto}
                                    alt={item.nombre}
                                    className="w-full h-48 object-cover "
                                />

                                {/* Indicador de tipo */}
                                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${
                                    item.tipo === 'Aula' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-purple-500 text-white'
                                }`}>
                                    {item.tipo}
                                </div>

                                {/* Indicador de disponibilidad (solo para equipos) */}
                                {item.tipo === 'Equipo' && (
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                                        item.disponibilidad 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-red-500 text-white'
                                    }`}>
                                        {item.disponibilidad ? 'Disponible' : 'Ocupado'}
                                    </div>
                                )}
                            </figure>
                            <div className="card-body p-4">
                                <h2 className="card-title text-lg group-hover:text-primario transition-colors duration-300">
                                    {item.nombre}
                                </h2>
                                <p className="text-gray-600 text-sm line-clamp-2">
                                    {item.descripcion}
                                </p>
                                
                                {/* Información común */}
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-gray-500">
                                        <span className="font-semibold">Ubicación:</span> {item.ubicacion}
                                    </p>
                                    
                                    
                                </div>
                                <div className="card-actions justify-end mt-3">
                                    <button className="btn btn-sm bg-primario text-white border-none hover:bg-red-700 transition-colors duration-300">
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                        <div className="text-center">
                            <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron recursos</h3>
                            <p className="text-gray-500 mb-4">
                                {busqueda.trim() ? (
                                    <>No hay {filtroTipo !== 'Todos' ? filtroTipo.toLowerCase() + 's' : 'recursos'} que coincidan con "{busqueda}"</>
                                ) : (
                                    <>No hay {filtroTipo !== 'Todos' ? filtroTipo.toLowerCase() + 's' : 'recursos'} disponibles con los filtros seleccionados</>
                                )}
                            </p>
                            <button
                                onClick={() => {
                                    setBusqueda('');
                                    setFiltroTipo('Todos');
                                }}
                                className="btn bg-primario text-white border-none hover:bg-red-700"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
