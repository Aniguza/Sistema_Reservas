import React, { forwardRef, useState } from 'react'
import { FaSearch } from "react-icons/fa";
import { useInitialData } from '../../hooks/useInitialData';

export const AgregarEquipos = forwardRef(({ onSave, initialSelected = [] }, ref) => {
    const { equipos, isLoading: loading, error } = useInitialData();
    const [selectedEquipos, setSelectedEquipos] = useState(initialSelected);
    const [busqueda, setBusqueda] = useState('');

    const handleToggle = (id) => {
        if (selectedEquipos.includes(id)) {
            setSelectedEquipos(selectedEquipos.filter(item => item !== id));
        } else {
            setSelectedEquipos([...selectedEquipos, id]);
        }
    };

    const handleSave = () => {
        onSave(selectedEquipos);
        ref.current?.close();
    };

    // Filtrar equipos según búsqueda
    const equiposFiltrados = equipos.filter(equipo => {
        if (!busqueda.trim()) return true;
        const termino = busqueda.toLowerCase();
        const nombre = (equipo.name || equipo.nombre || '').toLowerCase();
        const categoria = (equipo.category || '').toLowerCase();
        return nombre.includes(termino) || categoria.includes(termino);
    });

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

                {/* Buscador */}
                <div className="mb-4">
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
                </div>

                <div className="space-y-4">
                    {loading && <p className="text-center">Cargando equipos...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}

                    {!loading && !error && (
                        <div className="max-h-96 overflow-y-auto border rounded-lg p-3">
                            {equiposFiltrados.length === 0 ? (
                                <p className="text-center text-gray-500">
                                    {busqueda.trim() ? 'No se encontraron equipos' : 'No hay equipos disponibles.'}
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {equiposFiltrados.map((equipo) => (
                                        <label key={equipo._id} className="label cursor-pointer justify-start gap-3 hover:bg-base-200 p-3 rounded border">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary"
                                                checked={selectedEquipos.includes(equipo._id)}
                                                onChange={() => handleToggle(equipo._id)}
                                            />
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="label-text font-medium truncate">{equipo.name || equipo.nombre || "Equipo sin nombre"}</span>
                                                <span className="text-xs text-gray-400">{equipo.disponibilidad ? "Disponible" : "Ocupado"}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
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
