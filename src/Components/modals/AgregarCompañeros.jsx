import React, { forwardRef, useState, useRef } from 'react'
import { FaPlus, FaTrash, FaSearch } from "react-icons/fa";
import { useInitialData } from '../../hooks/useInitialData';

export const AgregarCompañeros = forwardRef(({ onSave, initialCodes = [] }, ref) => {
    const { usuarios } = useInitialData();
    const [companeros, setCompaneros] = useState(initialCodes);
    const [currentCode, setCurrentCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);

    // Extraer código del correo (quitar @utp.edu.pe)
    const extraerCodigo = (correo) => {
        if (!correo) return '';
        return correo.replace('@utp.edu.pe', '').toLowerCase();
    };

    // Buscar usuario por código
    const buscarUsuarioPorCodigo = (codigo) => {
        return usuarios.find(u => extraerCodigo(u.correo) === codigo.toLowerCase());
    };

    // Actualizar sugerencias mientras escribe
    const handleInputChange = (e) => {
        const value = e.target.value;
        setCurrentCode(value);
        
        if (value.trim().length > 0) {
            const filtered = usuarios.filter(usuario => {
                const codigo = extraerCodigo(usuario.correo);
                const nombre = (usuario.nombre || '').toLowerCase();
                const termino = value.toLowerCase();
                return codigo.includes(termino) || nombre.includes(termino);
            }).slice(0, 5); // Mostrar máximo 5 sugerencias
            
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleAdd = (usuario = null) => {
        let usuarioAgregar = usuario;
        
        if (!usuarioAgregar && currentCode.trim()) {
            usuarioAgregar = buscarUsuarioPorCodigo(currentCode.trim());
        }

        if (usuarioAgregar) {
            const yaExiste = companeros.some(c => c._id === usuarioAgregar._id);
            if (!yaExiste) {
                setCompaneros([...companeros, {
                    _id: usuarioAgregar._id,
                    nombre: usuarioAgregar.nombre,
                    codigo: extraerCodigo(usuarioAgregar.correo)
                }]);
                setCurrentCode("");
                setSuggestions([]);
                setShowSuggestions(false);
                inputRef.current?.focus();
            } else {
                setError('Este usuario ya fue agregado');
                setTimeout(() => setError(null), 3000);
            }
        } else {
            setError('Usuario no encontrado');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleDelete = (userId) => {
        setCompaneros(companeros.filter(c => c._id !== userId));
    };

    const handleSave = () => {
        onSave(companeros.map(c => c._id));
        ref.current?.close();
    };

    return (
        <dialog ref={ref} className="modal">
            <div className="modal-box w-11/12 max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Agregar Compañeros</h3>
                <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <p className="text-sm text-gray-600 mb-6">
                    Ingresa el código universitario de los estudiantes que participarán en la reserva.
                </p>

                <div className="space-y-4">
                    <div className="form-control relative">
                        <label className="label">
                            <span className="label-text">Código Universitario</span>
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Ej: u20205313"
                                    className="input input-bordered w-full"
                                    value={currentCode}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => {
                                        if (suggestions.length > 0) setShowSuggestions(true);
                                    }}
                                />
                                
                                {/* Sugerencias */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {suggestions.map((usuario) => (
                                            <div
                                                key={usuario._id}
                                                className="p-3 hover:bg-base-200 cursor-pointer border-b last:border-b-0"
                                                onClick={() => handleAdd(usuario)}
                                            >
                                                <div className="font-medium">{usuario.nombre}</div>
                                                <div className="text-xs text-gray-500 font-mono">{extraerCodigo(usuario.correo)}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button 
                                className="btn bg-primario text-white hover:bg-red-700 border-none" 
                                onClick={() => handleAdd()} 
                                type="button"
                            >
                                <FaPlus className="w-4 h-4" />
                            </button>
                        </div>
                        {error && <p className="text-xs text-error mt-1">{error}</p>}
                    </div>

                    <div className="mt-6">
                        <h4 className="font-semibold mb-3">Compañeros Agregados ({companeros.length}):</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {companeros.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No hay compañeros agregados.</p>
                            ) : (
                                companeros.map((companero) => (
                                    <div key={companero._id} className="flex items-center justify-between bg-base-200 p-3 rounded-lg">
                                        <div>
                                            <div className="font-medium">{companero.nombre}</div>
                                            <div className="text-xs text-gray-500 font-mono">{companero.codigo}</div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-error text-white"
                                            onClick={() => handleDelete(companero._id)}
                                            type="button"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
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
                            Guardar Compañeros
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    )
});

AgregarCompañeros.displayName = 'AgregarCompañeros';
