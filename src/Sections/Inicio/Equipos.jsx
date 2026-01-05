import React, { useEffect, useMemo, useState } from 'react'
import { OptimizedImage } from '../../Components/OptimizedImage.jsx';
import { equiposService } from '../../services/equiposService';

export const Equipos = () => {
    const [equipos, setEquipos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const obtenerEquipos = async () => {
            setIsLoading(true);
            setError(null);
                try {
                    const data = await equiposService.getAllEquipos();

                    const arraysFound = [];

                    const walk = (node) => {
                        if (!node) return;
                        if (Array.isArray(node)) {
                            arraysFound.push(node);
                            return;
                        }
                        if (typeof node === 'object') {
                            // Detect array-like objects with numeric keys
                            const keys = Object.keys(node);
                            const allNumeric = keys.length > 0 && keys.every(k => /^\d+$/.test(k));
                            if (allNumeric) {
                                const converted = keys
                                    .map(k => node[k])
                                    .filter(v => v !== undefined);
                                if (converted.length) {
                                    arraysFound.push(converted);
                                }
                            }
                            for (const value of Object.values(node)) {
                                walk(value);
                            }
                        }
                    };


                    walk(data);
                    console.debug('equipos - respuesta raw:', data, 'arraysFound:', arraysFound);

                    let parsed = null;
                    if (arraysFound.length > 0) {
                        // Prefer the longest array found
                        parsed = arraysFound.reduce((a, b) => (a.length >= b.length ? a : b), arraysFound[0]);
                    }

                    if (parsed && parsed.length > 0) {
                        console.debug('equipos - parsed array length:', parsed.length);
                        setEquipos(parsed);
                    } else {
                        console.warn('Respuesta de equipos sin arrays detectables:', data);
                        setEquipos([]);
                    }
            } catch (err) {
                console.error('Error obteniendo equipos:', err);
                setError('No se pudieron cargar los equipos en este momento.');
                setEquipos([]);
            } finally {
                setIsLoading(false);
            }
        };

        obtenerEquipos();
    }, []);

    const [equiposRandom, setEquiposRandom] = useState([]);

    const pickRandomEquipos = (list, count = 3) => {
        if (!Array.isArray(list) || list.length === 0) return [];
        if (list.length <= count) return [...list];
        const copiado = [...list];
        for (let i = copiado.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = copiado[i];
            copiado[i] = copiado[j];
            copiado[j] = temp;
        }
        return copiado.slice(0, count);
    };

    // Genera selección aleatoria al montar y cuando cambian los equipos
    useEffect(() => {
        setEquiposRandom(pickRandomEquipos(equipos, 3));
    }, [equipos]);

    return (
        <div className="p-10 text-center">
            <h2 className="text-3xl font-bold mb-5">Equipos Disponibles</h2>
            {isLoading && (
                <p className="text-gray-500">Cargando equipos...</p>
            )}
            {error && (
                <p className="text-red-500 mb-4">{error}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {equiposRandom.length === 0 ? (
                    <p className="col-span-full text-gray-500">No hay equipos disponibles en este momento. Revisa la consola para más detalles.</p>
                ) : equiposRandom.map((equipo, idx) => (
                    <div key={equipo._id || equipo.id || equipo.nombre || idx} className="card w-96 ">
                        <figure className="px-10 pt-10">
                            <OptimizedImage
                                src={equipo.imagen}
                                alt={equipo.alt}
                                className="rounded-xl w-full h-auto" />
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
