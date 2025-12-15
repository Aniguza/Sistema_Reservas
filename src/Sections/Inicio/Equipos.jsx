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
                const flattenArray = (payload) => {
                    if (Array.isArray(payload)) {
                        return payload;
                    }
                    if (payload && typeof payload === 'object') {
                        for (const value of Object.values(payload)) {
                            const nested = flattenArray(value);
                            if (Array.isArray(nested)) {
                                return nested;
                            }
                        }
                    }
                    return null;
                };

                const parsed = flattenArray(data);
                if (parsed) {
                    setEquipos(parsed);
                } else {
                    console.warn('Formato de respuesta inesperado para equipos:', data);
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

    const equiposRandom = useMemo(() => {
        if (!equipos || equipos.length === 0) {
            return [];
        }

        if (equipos.length <= 3) {
            return [...equipos];
        }

        const copiado = [...equipos];
        for (let i = copiado.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = copiado[i];
            copiado[i] = copiado[j];
            copiado[j] = temp;
        }
        return copiado.slice(0, 3);
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
                    <p className="col-span-full text-gray-500">No hay equipos disponibles en este momento.</p>
                ) : equiposRandom.map((equipo) => (
                    <div key={equipo._id || equipo.id} className="card w-96 ">
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
