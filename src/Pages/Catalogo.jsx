import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { FaSearch } from "react-icons/fa";
import { IoFilterSharp } from "react-icons/io5";
import { OptimizedImage } from '../Components/OptimizedImage.jsx';
import foto from '../assets/Images/equipo.png';
import { useInitialData } from '../hooks/useInitialData';


export const Catalogo = () => {
    const navigate = useNavigate();
    const { equipos, aulas, isLoading } = useInitialData();

    // Función para formatear correctamente el nombre de la categoría
    const formatearCategoria = (categoria) => {
        const categorias = {
            'electronicos': 'Electrónicos',
            'herramientas': 'Herramientas',
            'tecnologicos': 'Tecnológicos',
        };
        return categorias[categoria] || categoria || 'No especificada';
    };

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

    // Combinar aulas y equipos en un solo array, incluyendo equipos de aulas
    const todosLosRecursos = [
        ...aulas.map(aula => ({ ...aula, tipo: 'Aula' })),
        ...equipos.map(equipo => ({ ...equipo, tipo: 'Equipo' })),
        // Agregar equipos que están dentro de aulas (populados)
        ...aulas.flatMap(aula =>
            Array.isArray(aula.equipos)
                ? aula.equipos
                    .filter(equipo => equipo && typeof equipo === 'object' && equipo._id)
                    .map(equipo => ({
                        ...equipo,
                        tipo: 'Equipo',
                        aulaAsociada: aula.codigo // Agregar referencia al aula
                    }))
                : []
        )
    ];

    // Eliminar duplicados de equipos (por si un equipo está en la lista general y en un aula)
    const recursosUnicos = todosLosRecursos.reduce((acc, recurso) => {
        const existe = acc.find(r => r._id === recurso._id);
        if (!existe) {
            acc.push(recurso);
        } else if (recurso.aulaAsociada && !existe.aulaAsociada) {
            // Si el recurso tiene aula asociada y el existente no, actualizar
            existe.aulaAsociada = recurso.aulaAsociada;
        }
        return acc;
    }, []);

    // Filtrar recursos en tiempo real basado en la búsqueda y filtros
    const recursosFiltrados = recursosUnicos.filter(recurso => {
        // Filtro por tipo
        if (filtroTipo !== 'Todos' && recurso.tipo !== filtroTipo) {
            return false;
        }

        // Filtro por categoría (solo aplicar a equipos cuando hay un filtro seleccionado)
        if (filtroCategoria !== 'Todos') {
            if (recurso.tipo === 'Equipo' && recurso.category !== filtroCategoria) {
                //escribir correctamente, por ejemplo si es electronicos, escribir "Electrónicos"
                if ( recurso.category !== 'electronicos') {
                    re
                }
                return false;
            }
            // Si es un aula y hay filtro de categoría, no mostrarla
            if (recurso.tipo === 'Aula') {
                return false;
            }
        }

        // Filtro por disponibilidad (solo aplicar a equipos cuando hay un filtro seleccionado)
        if (filtroDisponibilidad !== 'Todos') {
            if (recurso.tipo === 'Equipo') {
                const estaDisponible = filtroDisponibilidad === 'Disponible';
                if (recurso.disponibilidad !== estaDisponible) {
                    return false;
                }
            }
            // Si es un aula y hay filtro de disponibilidad, no mostrarla
            if (recurso.tipo === 'Aula') {
                return false;
            }
        }

        // Filtro por ubicación (mostrar aula Y sus equipos)
        if (filtroUbicacion !== 'Todos') {
            // Mostrar el aula si coincide con el filtro
            if (recurso.tipo === 'Aula' && recurso.codigo === filtroUbicacion) {
                return true;
            }
            // Mostrar equipos que pertenecen a esa aula
            if (recurso.tipo === 'Equipo' && recurso.aulaAsociada === filtroUbicacion) {
                return true;
            }
            return false;
        }

        // Si no hay búsqueda, mostrar todos (que pasen los filtros)
        if (!busqueda.trim()) return true;

        const terminoBusqueda = busqueda.toLowerCase().trim();

        // Búsqueda para ambos tipos
        const coincideNombre = recurso.name?.toLowerCase().includes(terminoBusqueda);
        const coincideDescripcion = recurso.description?.toLowerCase().includes(terminoBusqueda);

        if (recurso.tipo === 'Equipo') {
            const coincideCategoria = recurso.category?.toLowerCase().includes(terminoBusqueda);
            return coincideNombre || coincideDescripcion || coincideCategoria;
        } else {
            const coincideCodigo = recurso.codigo?.toLowerCase().includes(terminoBusqueda);
            return coincideNombre || coincideDescripcion || coincideCodigo;
        }
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
                    <option value="electronicos">Electrónicos</option>
                    <option value="herramientas">Herramientas</option>
                    <option value="tecnologicos">Tecnológicos</option>
                </select>
                <select value={filtroDisponibilidad} onChange={(e) => setFiltroDisponibilidad(e.target.value)} className="select ">
                    <option value="Todos">Disponibilidad</option>
                    <option value="Disponible">Disponibles</option>
                    <option value="NoDisponible">No Disponibles</option>
                </select>
                <select value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)} className="select ">
                    <option value="Todos">Ubicación</option>
                    {aulas.map((aula) => (
                        <option key={aula._id} value={aula.codigo}>
                            {aula.name}
                        </option>
                    ))}
                </select>

            </div>

            {/* Contador de resultados */}
            <div className="mt-4 mb-2">
                <p className="text-sm text-gray-600">
                    {busqueda.trim() ? (
                        <>Mostrando {recursosFiltrados.length} resultado{recursosFiltrados.length !== 1 ? 's' : ''} para "{busqueda}"</>
                    ) : (
                        <>Mostrando {recursosFiltrados.length} recurso{recursosFiltrados.length !== 1 ? 's' : ''} disponible{recursosFiltrados.length !== 1 ? 's' : ''}</>
                    )}
                </p>
            </div>



            <div className='mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-10'>
                {recursosFiltrados.length > 0 ? (
                    recursosFiltrados.map((recurso, index) => (
                        <div
                            className="card bg-baseGris w-full max-w-60 shadow-sm cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-white border-2 border-transparent hover:border-primario group"
                            key={recurso._id || index}
                            onClick={() => handleCardClick({ ...recurso, id: recurso._id })}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleCardClick({ ...recurso, id: recurso._id });
                                }
                            }}
                        >
                            <figure className="relative overflow-hidden">
                                <OptimizedImage
                                    src={recurso.imageUrl || foto}
                                    alt={recurso.name}
                                    className="w-full h-48 object-cover "
                                />

                                {/* Indicador de tipo */}
                                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${recurso.tipo === 'Aula' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                                    }`}>
                                    {recurso.tipo}
                                </div>

                                {/* Indicador de disponibilidad (solo para equipos) */}
                                {recurso.tipo === 'Equipo' && (
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${recurso.disponibilidad ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                        {recurso.disponibilidad ? 'Disponible' : 'Ocupado'}
                                    </div>
                                )}
                            </figure>
                            <div className="card-body p-4">
                                <h2 className="card-title text-lg group-hover:text-primario transition-colors duration-300">
                                    {recurso.name}
                                </h2>
                                <div 
                                    className="text-gray-600 text-sm line-clamp-2 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: recurso.description || 'Sin descripción' }}
                                />

                                {/* Información según tipo */}
                                <div className="mt-2 space-y-1">
                                    {recurso.tipo === 'Equipo' ? (
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold">Categoría:</span> {formatearCategoria(recurso.category)}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold">Código:</span> {recurso.codigo || 'No especificado'}
                                        </p>
                                    )}
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron equipos</h3>
                            <p className="text-gray-500 mb-4">
                                No hay equipos disponibles en este momento
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
