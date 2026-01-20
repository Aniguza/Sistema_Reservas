import React, { forwardRef, useState, useEffect, useCallback } from 'react'
import { FaSearch, FaMinus, FaPlus } from "react-icons/fa";
import { useInitialData } from '../../hooks/useInitialData';
import { buildUrl } from '../../config/api.config';
import { API_ENDPOINTS } from '../../config/endpoints.config';

export const AgregarEquipos = forwardRef(({ onSave, initialSelected = [], initialSelectedAula = null, fechaReserva, horaInicio, horaFin }, ref) => {
    const { equipos, aulas, isLoading: loading, error } = useInitialData();
    // selectedEquipos ahora es un array de objetos: [{ equipo: id, cantidad: num }]
    const [selectedEquipos, setSelectedEquipos] = useState(initialSelected);
    // selectedAula es un solo ID de aula (solo se puede seleccionar una)
    const [selectedAula, setSelectedAula] = useState(initialSelectedAula);
    const [busqueda, setBusqueda] = useState('');
    const [filtroAula, setFiltroAula] = useState('Todas');
    const [activeTab, setActiveTab] = useState('equipos'); // 'equipos' o 'aulas'
    
    // Estado para almacenar las cantidades ocupadas por equipo en el horario seleccionado
    const [cantidadesOcupadas, setCantidadesOcupadas] = useState({});
    const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false);

    // Función para verificar si dos rangos de hora se solapan
    const horariosSeSuperponen = (inicio1, fin1, inicio2, fin2) => {
        return inicio1 < fin2 && fin1 > inicio2;
    };

    // Consultar reservas y calcular disponibilidad real para la fecha/hora seleccionada
    const consultarDisponibilidadReal = useCallback(async () => {
        if (!fechaReserva || !horaInicio || !horaFin) {
            setCantidadesOcupadas({});
            return;
        }

        try {
            setCargandoDisponibilidad(true);
            const token = localStorage.getItem('access_token');
            
            // Obtener todas las reservas
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.base), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Error al consultar reservas');
                return;
            }

            const reservas = await response.json();
            
            // Filtrar reservas que:
            // 1. Están confirmadas
            // 2. Son para la misma fecha
            // 3. Se superponen con el horario seleccionado
            const fechaSeleccionada = new Date(fechaReserva + 'T00:00:00');
            
            const reservasConflicto = reservas.filter(reserva => {
                // Solo reservas confirmadas
                if (reserva.estado !== 'confirmada') return false;
                
                // Verificar misma fecha
                const fechaReservaExistente = new Date(reserva.fecha);
                if (fechaReservaExistente.toDateString() !== fechaSeleccionada.toDateString()) return false;
                
                // Verificar superposición de horarios
                return horariosSeSuperponen(horaInicio, horaFin, reserva.horaInicio, reserva.horaFin);
            });

            // Calcular cantidades ocupadas por equipo
            const ocupadas = {};
            reservasConflicto.forEach(reserva => {
                if (Array.isArray(reserva.equipos)) {
                    reserva.equipos.forEach(eq => {
                        const equipoId = typeof eq === 'object' ? (eq.equipo || eq._id) : eq;
                        const cantidad = typeof eq === 'object' ? (eq.cantidad || 1) : 1;
                        ocupadas[equipoId] = (ocupadas[equipoId] || 0) + cantidad;
                    });
                }
            });

            setCantidadesOcupadas(ocupadas);
        } catch (error) {
            console.error('Error al consultar disponibilidad:', error);
        } finally {
            setCargandoDisponibilidad(false);
        }
    }, [fechaReserva, horaInicio, horaFin]);

    // Ejecutar consulta cuando cambian fecha/hora
    useEffect(() => {
        consultarDisponibilidadReal();
    }, [consultarDisponibilidadReal]);

    // Obtener equipos con información del aula (debe estar antes de las funciones que lo usan)
    const equiposConAula = equipos.map(equipo => {
        // Buscar en qué aula está el equipo
        const aulaDelEquipo = aulas.find(aula =>
            Array.isArray(aula.equipos) && aula.equipos.some(e =>
                (typeof e === 'object' && e._id === equipo._id) || e === equipo._id
            )
        );
        return {
            ...equipo,
            aula: aulaDelEquipo || null
        };
    });

    // Obtener la cantidad total de un equipo
    const getCantidadTotal = (equipo) => {
        // El campo viene como 'quantity' desde la API
        return equipo.quantity || equipo.cantidad || equipo.stock || 1;
    };

    // Obtener la cantidad disponible real de un equipo (considerando reservas en el horario)
    const getCantidadDisponible = (equipo) => {
        const cantidadTotal = getCantidadTotal(equipo);
        const cantidadOcupada = cantidadesOcupadas[equipo._id] || 0;
        return Math.max(0, cantidadTotal - cantidadOcupada);
    };

    // Verificar si un equipo está disponible para el horario seleccionado
    const estaDisponibleParaHorario = (equipo) => {
        // Si el equipo está en mantenimiento o tiene otro estado no disponible, no está disponible
        if (equipo.disponibilidad === 'en mantenimiento') return false;
        
        // Si no hay fecha/hora seleccionada, usar el campo disponibilidad del equipo
        if (!fechaReserva || !horaInicio || !horaFin) {
            return equipo.disponibilidad === 'disponible';
        }
        
        // Verificar si hay cantidad disponible para el horario
        return getCantidadDisponible(equipo) > 0;
    };

    // Obtener el aula de un equipo por su ID
    const getAulaDeEquipo = (equipoId) => {
        const equipo = equiposConAula.find(eq => eq._id === equipoId);
        return equipo?.aula?._id || null;
    };

    // Determinar el aula de los equipos seleccionados (todos deben ser de la misma aula)
    const aulaDeEquiposSeleccionados = selectedEquipos.length > 0 
        ? getAulaDeEquipo(selectedEquipos[0].equipo)
        : null;

    // Verificar si un equipo está en otra aula (diferente a la de los equipos ya seleccionados)
    const estaEnOtraAula = (equipo) => {
        if (selectedEquipos.length === 0) return false;
        const aulaDelEquipo = equipo.aula?._id || null;
        return aulaDelEquipo !== aulaDeEquiposSeleccionados;
    };

    const handleToggle = (id, equipo) => {
        // Solo permitir seleccionar si el equipo está disponible para el horario
        if (!estaDisponibleParaHorario(equipo)) {
            return;
        }

        // No permitir seleccionar si está en otra aula
        if (estaEnOtraAula(equipo)) {
            return;
        }

        const existe = selectedEquipos.find(item => item.equipo === id);
        if (existe) {
            // Remover el equipo
            setSelectedEquipos(selectedEquipos.filter(item => item.equipo !== id));
        } else {
            // Agregar el equipo con cantidad inicial de 1
            setSelectedEquipos([...selectedEquipos, { equipo: id, cantidad: 1 }]);
        }
    };

    const handleIncrementCantidad = (id, cantidadDisponible) => {
        setSelectedEquipos(selectedEquipos.map(item => {
            if (item.equipo === id) {
                const nuevaCantidad = item.cantidad + 1;
                // No permitir exceder la cantidad disponible
                return { ...item, cantidad: Math.min(nuevaCantidad, cantidadDisponible) };
            }
            return item;
        }));
    };

    const handleDecrementCantidad = (id) => {
        setSelectedEquipos(selectedEquipos.map(item => {
            if (item.equipo === id) {
                const nuevaCantidad = item.cantidad - 1;
                // Mínimo 1
                return { ...item, cantidad: Math.max(1, nuevaCantidad) };
            }
            return item;
        }));
    };

    const handleCantidadChange = (id, cantidad, cantidadDisponible) => {
        const cantidadNum = parseInt(cantidad) || 1;
        setSelectedEquipos(selectedEquipos.map(item =>
            item.equipo === id ? { ...item, cantidad: Math.max(1, Math.min(cantidadNum, cantidadDisponible)) } : item
        ));
    };

    const handleSelectAula = (aulaId) => {
        // Si ya está seleccionada, la deseleccionamos; si no, la seleccionamos
        setSelectedAula(selectedAula === aulaId ? null : aulaId);
    };

    const handleSave = () => {
        // Si hay un aula seleccionada, solo enviamos el aula (no equipos)
        // Si no hay aula, enviamos los equipos
        if (selectedAula) {
            onSave([], selectedAula);
        } else {
            onSave(selectedEquipos, null);
        }
        ref.current?.close();
    };

    // Agrupar equipos por aula
    const equiposPorAula = aulas.reduce((acc, aula) => {
        const equiposDeAula = equiposConAula.filter(eq => eq.aula?._id === aula._id);
        if (equiposDeAula.length > 0) {
            acc[aula._id] = {
                aula: aula,
                equipos: equiposDeAula
            };
        }
        return acc;
    }, {});

    // Equipos sin aula asignada
    const equiposSinAula = equiposConAula.filter(eq => !eq.aula);

    // Filtrar según búsqueda y aula seleccionada
    const filtrarEquipos = (listaEquipos) => {
        return listaEquipos.filter(equipo => {
            // Filtro por búsqueda
            if (busqueda.trim()) {
                const termino = busqueda.toLowerCase();
                const nombre = (equipo.name || equipo.nombre || '').toLowerCase();
                const categoria = (equipo.category || '').toLowerCase();
                if (!nombre.includes(termino) && !categoria.includes(termino)) {
                    return false;
                }
            }
            return true;
        });
    };

    // Filtrar aulas según selección
    const aulasAMostrar = filtroAula === 'Todas'
        ? Object.values(equiposPorAula)
        : Object.values(equiposPorAula).filter(item => item.aula._id === filtroAula);

    // Filtrar aulas según búsqueda
    const filtrarAulas = (listaAulas) => {
        return listaAulas.filter(aula => {
            if (busqueda.trim()) {
                const termino = busqueda.toLowerCase();
                const nombre = (aula.name || '').toLowerCase();
                const codigo = (aula.codigo || '').toLowerCase();
                if (!nombre.includes(termino) && !codigo.includes(termino)) {
                    return false;
                }
            }
            return true;
        });
    };

    const aulasFiltradas = filtrarAulas(aulas);

    return (
        <dialog ref={ref} className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
                <h3 className="font-bold text-lg mb-4">Seleccionar Recursos</h3>
                <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <p className="text-sm text-gray-600 mb-4">
                    Si reservas uno o varios equipos, se reservará el aula con esos equipos automáticamente. Si reservas solo un aula, no podrás usar equipos de esa aula, solo en la que 
                </p>
                
                {/* Aviso si no hay fecha/hora seleccionada */}
                {(!fechaReserva || !horaInicio || !horaFin) && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-lg mb-4">
                        Selecciona primero la <strong>fecha</strong> y <strong>hora</strong> de la reserva para ver la disponibilidad real de los equipos.
                    </div>
                )}
                
                {/* Indicador de carga de disponibilidad */}
                {cargandoDisponibilidad && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
                        <span className="loading loading-spinner loading-sm"></span>
                        Verificando disponibilidad para el horario seleccionado...
                    </div>
                )}

                {/* Tabs como botones con background */}
                <div className="flex gap-2 mb-4">
                    <button
                        type="button"
                        className={`btn flex-1 ${selectedAula 
                            ? 'btn-disabled bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : activeTab === 'equipos' 
                                ? 'bg-primario text-white hover:bg-red-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => !selectedAula && setActiveTab('equipos')}
                        disabled={!!selectedAula}
                    >
                        Equipos {selectedEquipos.length > 0 && `(${selectedEquipos.length})`}
                        {selectedAula && <span className="ml-1 text-xs">(bloqueado)</span>}
                    </button>
                    <button
                        type="button"
                        className={`btn flex-1 ${selectedEquipos.length > 0 
                            ? 'btn-disabled bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : activeTab === 'aulas' 
                                ? 'bg-primario text-white hover:bg-red-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => selectedEquipos.length === 0 && setActiveTab('aulas')}
                        disabled={selectedEquipos.length > 0}
                    >
                        Aulas {selectedAula && '(1)'}
                        {selectedEquipos.length > 0 && <span className="ml-1 text-xs">(bloqueado)</span>}
                    </button>
                </div>

                {/* Buscador */}
                <div className="mb-4 space-y-3">
                    <label className="input input-bordered flex items-center gap-2">
                        <FaSearch className="text-gray-400" />
                        <input
                            type="text"
                            className="grow"
                            placeholder={activeTab === 'equipos' ? "Buscar equipos por nombre o categoría..." : "Buscar aulas por nombre o código..."}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </label>

                    {/* Filtro por aula solo visible en tab de equipos */}
                    {activeTab === 'equipos' && (
                        <select
                            className="select select-bordered w-full"
                            value={filtroAula}
                            onChange={(e) => setFiltroAula(e.target.value)}
                        >
                            <option value="Todas">Todas las ubicaciones</option>
                            {aulas.map((aula) => (
                                <option key={aula._id} value={aula._id}>
                                    {aula.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="space-y-4">
                    {loading && <p className="text-center">Cargando datos...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}

                    {!loading && !error && (
                        <div className="max-h-96 overflow-y-auto border rounded-lg p-3 space-y-4">
                            {/* Tab de Equipos */}
                            {activeTab === 'equipos' && (
                                <>
                                    {aulasAMostrar.length === 0 && equiposSinAula.length === 0 ? (
                                        <p className="text-center text-gray-500">
                                            {busqueda.trim() || filtroAula !== 'Todas' ? 'No se encontraron equipos' : 'No hay equipos disponibles.'}
                                        </p>
                                    ) : (
                                        <>
                                            {/* Equipos agrupados por aula */}
                                            {aulasAMostrar.map(({ aula, equipos: equiposAula }) => {
                                                const equiposFiltrados = filtrarEquipos(equiposAula);
                                                if (equiposFiltrados.length === 0) return null;

                                                return (
                                                    <div key={aula._id} className="space-y-2">
                                                        <div className='flex justify-between'>
                                                            <h4 className="font-semibold text-sm text-primario border-b pb-1">
                                                                {aula.name} ({equiposFiltrados.length})
                                                            </h4>
                                                            <p className='font-semibold text-sm text-gray-500'>{aula.codigo}</p>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {equiposFiltrados.map((equipo) => {
                                                                const estaDisponible = estaDisponibleParaHorario(equipo);
                                                                const cantidadDisponible = getCantidadDisponible(equipo);
                                                                const cantidadTotal = getCantidadTotal(equipo);
                                                                const equipoSeleccionado = selectedEquipos.find(item => item.equipo === equipo._id);
                                                                const estaSeleccionado = !!equipoSeleccionado;
                                                                const bloqueadoPorOtraAula = estaEnOtraAula(equipo);
                                                                const deshabilitado = !estaDisponible || bloqueadoPorOtraAula;
                                                                const enMantenimiento = equipo.disponibilidad === 'en mantenimiento';

                                                                return (
                                                                    <div
                                                                        key={equipo._id}
                                                                        className={`p-3 rounded border ${deshabilitado
                                                                                ? 'opacity-50 bg-gray-100'
                                                                                : 'hover:bg-base-200'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="checkbox checkbox-primary"
                                                                                checked={estaSeleccionado}
                                                                                onChange={() => handleToggle(equipo._id, equipo)}
                                                                                disabled={deshabilitado}
                                                                            />
                                                                            <div className="flex-1">
                                                                                <div className="font-medium">{equipo.name || equipo.nombre || "Equipo sin nombre"}</div>
                                                                                <div className={`text-xs ${bloqueadoPorOtraAula ? 'text-orange-600' : estaDisponible ? 'text-green-600' : 'text-red-600'}`}>
                                                                                    {bloqueadoPorOtraAula ? 'Bloqueado (otra aula seleccionada)' :
                                                                                        enMantenimiento ? 'En mantenimiento' :
                                                                                        estaDisponible ? `Disponible (${cantidadDisponible}/${cantidadTotal})` :
                                                                                        `Ocupado para este horario (0/${cantidadTotal})`}
                                                                                </div>
                                                                            </div>
                                                                            {estaSeleccionado && (() => {
                                                                            const cantidadActual = equipoSeleccionado.cantidad;
                                                                            return (
                                                                                <div className="flex flex-col items-end gap-1">
                                                                                    <div className="flex items-center gap-1">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleDecrementCantidad(equipo._id);
                                                                                            }}
                                                                                            disabled={cantidadActual <= 1}
                                                                                            className={`btn btn-sm btn-circle ${cantidadActual <= 1 ? 'btn-disabled bg-gray-200' : 'bg-primario hover:bg-red-700 text-white'}`}
                                                                                        >
                                                                                            <FaMinus className="w-3 h-3" />
                                                                                        </button>
                                                                                        <span className="w-10 text-center font-semibold text-lg">
                                                                                            {cantidadActual}
                                                                                        </span>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleIncrementCantidad(equipo._id, cantidadDisponible);
                                                                                            }}
                                                                                            disabled={cantidadActual >= cantidadDisponible}
                                                                                            className={`btn btn-sm btn-circle ${cantidadActual >= cantidadDisponible ? 'btn-disabled bg-gray-200' : 'bg-primario hover:bg-red-700 text-white'}`}
                                                                                        >
                                                                                            <FaPlus className="w-3 h-3" />
                                                                                        </button>
                                                                                    </div>
                                                                                    <span className="text-xs text-gray-500">
                                                                                        Disponible: {cantidadDisponible}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Equipos sin aula (solo si filtro es "Todas") */}
                                            {filtroAula === 'Todas' && equiposSinAula.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-sm text-gray-500 border-b pb-1">
                                                        Sin ubicación asignada ({filtrarEquipos(equiposSinAula).length})
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {filtrarEquipos(equiposSinAula).map((equipo) => {
                                                            const estaDisponible = estaDisponibleParaHorario(equipo);
                                                            const cantidadDisponible = getCantidadDisponible(equipo);
                                                            const cantidadTotal = getCantidadTotal(equipo);
                                                            const equipoSeleccionado = selectedEquipos.find(item => item.equipo === equipo._id);
                                                            const estaSeleccionado = !!equipoSeleccionado;
                                                            const bloqueadoPorOtraAula = estaEnOtraAula(equipo);
                                                            const deshabilitado = !estaDisponible || bloqueadoPorOtraAula;
                                                            const enMantenimiento = equipo.disponibilidad === 'en mantenimiento';

                                                            return (
                                                                <div
                                                                    key={equipo._id}
                                                                    className={`p-3 rounded border ${deshabilitado
                                                                            ? 'opacity-50 bg-gray-100'
                                                                            : 'hover:bg-base-200'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="checkbox checkbox-primary"
                                                                            checked={estaSeleccionado}
                                                                            onChange={() => handleToggle(equipo._id, equipo)}
                                                                            disabled={deshabilitado}
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="font-medium">{equipo.name || equipo.nombre || "Equipo sin nombre"}</div>
                                                                            <div className={`text-xs ${bloqueadoPorOtraAula ? 'text-orange-600' : estaDisponible ? 'text-green-600' : 'text-red-600'}`}>
                                                                                {bloqueadoPorOtraAula ? 'Bloqueado (otra aula seleccionada)' :
                                                                                    enMantenimiento ? 'En mantenimiento' :
                                                                                    estaDisponible ? `Disponible (${cantidadDisponible}/${cantidadTotal})` :
                                                                                    `Ocupado para este horario (0/${cantidadTotal})`}
                                                                            </div>
                                                                        </div>
                                                                        {estaSeleccionado && (() => {
                                                                            const cantidadActual = equipoSeleccionado.cantidad;
                                                                            return (
                                                                                <div className="flex flex-col items-end gap-1">
                                                                                    <div className="flex items-center gap-1">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleDecrementCantidad(equipo._id);
                                                                                            }}
                                                                                            disabled={cantidadActual <= 1}
                                                                                            className={`btn btn-sm btn-circle ${cantidadActual <= 1 ? 'btn-disabled bg-gray-200' : 'bg-primario hover:bg-red-700 text-white'}`}
                                                                                        >
                                                                                            <FaMinus className="w-3 h-3" />
                                                                                        </button>
                                                                                        <span className="w-10 text-center font-semibold text-lg">
                                                                                            {cantidadActual}
                                                                                        </span>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleIncrementCantidad(equipo._id, cantidadDisponible);
                                                                                            }}
                                                                                            disabled={cantidadActual >= cantidadDisponible}
                                                                                            className={`btn btn-sm btn-circle ${cantidadActual >= cantidadDisponible ? 'btn-disabled bg-gray-200' : 'bg-primario hover:bg-red-700 text-white'}`}
                                                                                        >
                                                                                            <FaPlus className="w-3 h-3" />
                                                                                        </button>
                                                                                    </div>
                                                                                    <span className="text-xs text-gray-500">
                                                                                        Disponible: {cantidadDisponible}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {/* Tab de Aulas */}
                            {activeTab === 'aulas' && (
                                <>
                                    {aulasFiltradas.length === 0 ? (
                                        <p className="text-center text-gray-500">
                                            {busqueda.trim() ? 'No se encontraron aulas' : 'No hay aulas disponibles.'}
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {aulasFiltradas.map((aula) => {
                                                const estaSeleccionada = selectedAula === aula._id;
                                                const cantidadEquipos = Array.isArray(aula.equipos) ? aula.equipos.length : 0;

                                                return (
                                                    <div
                                                        key={aula._id}
                                                        className={`p-3 rounded border cursor-pointer ${estaSeleccionada ? 'bg-primario/10 border-primario' : 'hover:bg-base-200'}`}
                                                        onClick={() => handleSelectAula(aula._id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                name="aula-seleccionada"
                                                                className="radio radio-primary"
                                                                checked={estaSeleccionada}
                                                                onChange={() => handleSelectAula(aula._id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium">{aula.name}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {aula.codigo || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="text-sm text-gray-500 flex gap-4">
                        <span>{selectedEquipos.length} equipo(s) seleccionado(s)</span>
                        <span>{selectedAula ? '1 aula seleccionada' : 'Ninguna aula seleccionada'}</span>
                    </div>
                    
                    {/* Nota informativa cuando hay equipos seleccionados de un aula */}
                    {selectedEquipos.length > 0 && aulaDeEquiposSeleccionados && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            Solo puedes seleccionar equipos del aula: <strong>{aulas.find(a => a._id === aulaDeEquiposSeleccionados)?.name || 'Sin ubicación'}</strong>
                        </div>
                    )}

                    {/* Nota informativa cuando seleccionan equipos sin aula */}
                    {selectedEquipos.length > 0 && !aulaDeEquiposSeleccionados && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            Solo puedes seleccionar equipos <strong>sin ubicación asignada</strong>
                        </div>
                    )}
                </div>

                <div className="modal-action">
                    <form method="dialog" className="flex gap-2">
                        <button className="btn btn-outline">Cancelar</button>
                        <button
                            className="btn bg-primario text-white hover:bg-red-700 border-none"
                            onClick={handleSave}
                            type="button"
                        >
                            Guardar Selección
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    )
});

AgregarEquipos.displayName = 'AgregarEquipos';
