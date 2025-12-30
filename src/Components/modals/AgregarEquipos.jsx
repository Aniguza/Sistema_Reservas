import React, { forwardRef, useState } from 'react'
import { FaSearch } from "react-icons/fa";
import { useInitialData } from '../../hooks/useInitialData';

export const AgregarEquipos = forwardRef(({ onSave, initialSelected = [] }, ref) => {
    const { equipos, aulas, isLoading: loading, error } = useInitialData();
    // selectedEquipos ahora es un array de objetos: [{ equipo: id, cantidad: num }]
    const [selectedEquipos, setSelectedEquipos] = useState(initialSelected);
    const [busqueda, setBusqueda] = useState('');
    const [filtroAula, setFiltroAula] = useState('Todas');

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

    const handleSave = () => {
        onSave(selectedEquipos);
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

    return (
        <dialog ref={ref} className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
                <h3 className="font-bold text-lg mb-4">Seleccionar Equipos</h3>
                <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <p className="text-sm text-gray-600 mb-4">
                    Selecciona los equipos que deseas reservar.
                </p>

                {/* Buscador y filtros */}
                <div className="mb-4 space-y-3">
                    <label className="input input-bordered flex items-center gap-2">
                        <FaSearch className="text-gray-400" />
                        <input
                            type="text"
                            className="grow"
                            placeholder="Buscar equipos por nombre o categoría..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </label>

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
                </div>

                <div className="space-y-4">
                    {loading && <p className="text-center">Cargando equipos...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}

                    {!loading && !error && (
                        <div className="max-h-96 overflow-y-auto border rounded-lg p-3 space-y-4">
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
                        </div>
                    )}

                    <div className="text-sm text-gray-500">
                        {selectedEquipos.length} equipos seleccionados
                    </div>
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
