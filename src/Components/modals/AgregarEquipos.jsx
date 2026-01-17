import React, { forwardRef, useState } from 'react'
import { FaSearch } from "react-icons/fa";
import { useInitialData } from '../../hooks/useInitialData';

export const AgregarEquipos = forwardRef(({ onSave, initialSelected = [], initialSelectedAula = null }, ref) => {
    const { equipos, aulas, isLoading: loading, error } = useInitialData();
    // selectedEquipos ahora es un array de objetos: [{ equipo: id, cantidad: num }]
    const [selectedEquipos, setSelectedEquipos] = useState(initialSelected);
    // selectedAula es un solo ID de aula (solo se puede seleccionar una)
    const [selectedAula, setSelectedAula] = useState(initialSelectedAula);
    const [busqueda, setBusqueda] = useState('');
    const [filtroAula, setFiltroAula] = useState('Todas');
    const [activeTab, setActiveTab] = useState('equipos'); // 'equipos' o 'aulas'

    const handleToggle = (id, disponibilidad) => {
        // Solo permitir seleccionar si el equipo está disponible
        if (disponibilidad !== 'disponible') {
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

    const handleCantidadChange = (id, cantidad) => {
        const cantidadNum = parseInt(cantidad) || 1;
        setSelectedEquipos(selectedEquipos.map(item =>
            item.equipo === id ? { ...item, cantidad: Math.max(1, cantidadNum) } : item
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

    // Obtener equipos con información del aula
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
                    Selecciona los equipos y/o aulas que deseas reservar.
                </p>

                {/* Tabs como botones con background */}
                <div className="flex gap-2 mb-4">
                    <button
                        type="button"
                        className={`btn flex-1 ${activeTab === 'equipos' 
                            ? 'bg-primario text-white hover:bg-red-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => setActiveTab('equipos')}
                    >
                        Equipos {selectedEquipos.length > 0 && `(${selectedEquipos.length})`}
                    </button>
                    <button
                        type="button"
                        className={`btn flex-1 ${activeTab === 'aulas' 
                            ? 'bg-primario text-white hover:bg-red-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => setActiveTab('aulas')}
                    >
                        Aulas {selectedAula && '(1)'}
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
                                                                const estaDisponible = equipo.disponibilidad === 'disponible';
                                                                const equipoSeleccionado = selectedEquipos.find(item => item.equipo === equipo._id);
                                                                const estaSeleccionado = !!equipoSeleccionado;

                                                                return (
                                                                    <div
                                                                        key={equipo._id}
                                                                        className={`p-3 rounded border ${estaDisponible
                                                                                ? 'hover:bg-base-200'
                                                                                : 'opacity-50 bg-gray-100'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="checkbox checkbox-primary"
                                                                                checked={estaSeleccionado}
                                                                                onChange={() => handleToggle(equipo._id, equipo.disponibilidad)}
                                                                                disabled={!estaDisponible}
                                                                            />
                                                                            <div className="flex-1">
                                                                                <div className="font-medium">{equipo.name || equipo.nombre || "Equipo sin nombre"}</div>
                                                                                <div className={`text-xs ${estaDisponible ? 'text-green-600' : 'text-red-600'}`}>
                                                                                    {equipo.disponibilidad === 'disponible' ? 'Disponible' :
                                                                                        equipo.disponibilidad === 'ocupado' ? 'Ocupado' :
                                                                                            equipo.disponibilidad === 'en mantenimiento' ? 'En mantenimiento' :
                                                                                                'No disponible'}
                                                                                </div>
                                                                            </div>
                                                                            {estaSeleccionado && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <label className="text-sm font-medium">Cantidad:</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        min="1"
                                                                                        value={equipoSeleccionado.cantidad}
                                                                                        onChange={(e) => handleCantidadChange(equipo._id, e.target.value)}
                                                                                        className="input input-bordered input-sm w-20"
                                                                                    />
                                                                                </div>
                                                                            )}
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
                                                            const estaDisponible = equipo.disponibilidad === 'disponible';
                                                            const equipoSeleccionado = selectedEquipos.find(item => item.equipo === equipo._id);
                                                            const estaSeleccionado = !!equipoSeleccionado;

                                                            return (
                                                                <div
                                                                    key={equipo._id}
                                                                    className={`p-3 rounded border ${estaDisponible
                                                                            ? 'hover:bg-base-200'
                                                                            : 'opacity-50 bg-gray-100'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="checkbox checkbox-primary"
                                                                            checked={estaSeleccionado}
                                                                            onChange={() => handleToggle(equipo._id, equipo.disponibilidad)}
                                                                            disabled={!estaDisponible}
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="font-medium">{equipo.name || equipo.nombre || "Equipo sin nombre"}</div>
                                                                            <div className={`text-xs ${estaDisponible ? 'text-green-600' : 'text-red-600'}`}>
                                                                                {equipo.disponibilidad === 'disponible' ? 'Disponible' :
                                                                                    equipo.disponibilidad === 'ocupado' ? 'Ocupado' :
                                                                                        equipo.disponibilidad === 'en mantenimiento' ? 'En mantenimiento' :
                                                                                            'No disponible'}
                                                                            </div>
                                                                        </div>
                                                                        {estaSeleccionado && (
                                                                            <div className="flex items-center gap-2">
                                                                                <label className="text-sm font-medium">Cantidad:</label>
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={equipoSeleccionado.cantidad}
                                                                                    onChange={(e) => handleCantidadChange(equipo._id, e.target.value)}
                                                                                    className="input input-bordered input-sm w-20"
                                                                                />
                                                                            </div>
                                                                        )}
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
                                                                    Código: {aula.codigo || 'N/A'}
                                                                </div>
                                                                {aula.capacidad && (
                                                                    <div className="text-xs text-gray-500">
                                                                        Capacidad: {aula.capacidad} personas
                                                                    </div>
                                                                )}
                                                                {cantidadEquipos > 0 && (
                                                                    <div className="text-xs text-blue-600">
                                                                        {cantidadEquipos} equipo(s) asignado(s)
                                                                    </div>
                                                                )}
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
                    
                    {/* Nota informativa */}
                    {selectedAula && selectedEquipos.length > 0 && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                            Nota: Al seleccionar un aula, solo se enviará el aula (los equipos no se incluirán en la reserva).
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
