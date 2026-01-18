import React, { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { CalendarioDisponibilidad } from '../Components/CalendarioDisponibilidad'
import { reservasService } from '../services/reservasService'
import { formatTime12, formatISODateSafe } from '../utils/time'
import { OptimizedImage } from '../Components/OptimizedImage'

export const DetalleEquipo = () => {
    const { id } = useParams(); // Obtener el ID de la URL
    const navigate = useNavigate();

    // Obtener datos de Redux
    const { items: equipos } = useSelector(state => state.equipos);
    const { items: aulas } = useSelector(state => state.aulas);

    // Determinar el tipo basado en la URL actual
    const currentPath = window.location.pathname;
    const isAula = currentPath.includes('/aula/');

    // Buscar el recurso según el tipo determinado por la URL
    let recurso, tipoRecurso;

    if (isAula) {
        recurso = aulas.find(au => au._id === id);
        tipoRecurso = 'Aula';
    } else {
        recurso = equipos.find(eq => eq._id === id);
        tipoRecurso = 'Equipo';
    }

    const [reservasEquipo, setReservasEquipo] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        disponibles: 0,
        ocupadas: 0,
        porcentajeOcupacion: 0,
        reservasConfirmadas: 0
    });
    const [selectedDate, setSelectedDate] = useState({});
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastTouchDistance, setLastTouchDistance] = useState(null);
    const [lastTap, setLastTap] = useState(0);

    // Funciones para el zoom
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => {
        setZoomLevel(prev => {
            const newZoom = Math.max(prev - 0.5, 1);
            if (newZoom === 1) setPosition({ x: 0, y: 0 });
            return newZoom;
        });
    };
    const handleResetZoom = () => {
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };
    
    const handleWheel = (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    // Funciones para arrastrar la imagen (mouse)
    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Funciones táctiles para móviles
    const getTouchDistance = (touches) => {
        return Math.hypot(
            touches[0].clientX - touches[1].clientX,
            touches[0].clientY - touches[1].clientY
        );
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            // Pinch-to-zoom: guardar distancia inicial entre dedos
            setLastTouchDistance(getTouchDistance(e.touches));
        } else if (e.touches.length === 1) {
            // Detectar doble tap
            const now = Date.now();
            if (now - lastTap < 300) {
                // Doble tap: alternar zoom
                if (zoomLevel === 1) {
                    setZoomLevel(2);
                } else {
                    handleResetZoom();
                }
            }
            setLastTap(now);
            
            // Arrastrar con un dedo
            if (zoomLevel > 1) {
                setIsDragging(true);
                setDragStart({ 
                    x: e.touches[0].clientX - position.x, 
                    y: e.touches[0].clientY - position.y 
                });
            }
        }
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        
        if (e.touches.length === 2 && lastTouchDistance) {
            // Pinch-to-zoom
            const newDistance = getTouchDistance(e.touches);
            const delta = newDistance - lastTouchDistance;
            
            if (Math.abs(delta) > 5) {
                setZoomLevel(prev => {
                    const newZoom = prev + (delta > 0 ? 0.05 : -0.05);
                    const clampedZoom = Math.min(Math.max(newZoom, 1), 4);
                    if (clampedZoom === 1) setPosition({ x: 0, y: 0 });
                    return clampedZoom;
                });
                setLastTouchDistance(newDistance);
            }
        } else if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
            // Arrastrar
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setLastTouchDistance(null);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };

    useEffect(() => {
        if (!id) return;

        const fetchReservas = async () => {
            const ESTADOS_ACTIVOS = new Set(['pendiente', 'confirmada', 'reprogramada', 'en_curso']);
            try {
                const reservas = isAula
                    ? await reservasService.getReservasByAula(id)
                    : await reservasService.getReservasByEquipo(id);

                const reservasActivas = Array.isArray(reservas)
                    ? reservas.filter(reserva => ESTADOS_ACTIVOS.has(String(reserva.estado || '').toLowerCase()))
                    : [];

                setReservasEquipo(reservasActivas);
            } catch (error) {
                console.error('Error al obtener las reservas del recurso:', error);
                setReservasEquipo([]);
            }
        };

        fetchReservas();
    }, [id, isAula]);

    useEffect(() => {
        if (!recurso || !id) return;

        const totalDiasVisibles = 30;
        const fechasOcupadas = new Set(
            reservasEquipo
                .map(reserva => reserva?.fecha)
                .filter(Boolean)
                .map(fecha => {
                    try {
                        return new Date(fecha).toISOString().split('T')[0];
                    } catch (error) {
                        return null;
                    }
                })
                .filter(Boolean)
        );

        const ocupadas = fechasOcupadas.size;
        const disponibles = Math.max(0, totalDiasVisibles - ocupadas);
        const porcentaje = totalDiasVisibles > 0 ? Math.round((ocupadas / totalDiasVisibles) * 100) : 0;

        // Contar reservas confirmadas
        const reservasConfirmadas = reservasEquipo.filter(reserva =>
            String(reserva.estado || '').toLowerCase() === 'confirmada'
        ).length;

        setEstadisticas({
            total: totalDiasVisibles,
            disponibles,
            ocupadas,
            porcentajeOcupacion: porcentaje,
            reservasConfirmadas
        });
    }, [recurso, id, reservasEquipo]);

    const handleDateSelect = useCallback((fecha, reservas) => {
        // reservas puede ser null o un array de reservas para ese día
        setSelectedDate({ fecha, reservas: reservas || [] });
    }, []);



    const handleReserva = () => {
        // Redirigir al formulario de reserva
        navigate('/reservas');
    };

    // Si no se encuentra el recurso, mostrar mensaje de error
    if (!recurso) {
        return (
            <section className='max-w-[1400px] w-full px-5 font-lato mt-5 mb-10'>
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold text-gray-600 mb-4">Recurso no encontrado</h1>
                    <p className="text-gray-500 mb-6">El recurso que buscas no existe o ha sido removido.</p>
                    <Link to="/catalogo" className="btn bg-primario text-white hover:bg-red-700">
                        Volver al Catálogo
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className='max-w-[1400px] w-full px-5 font-lato mt-5 mb-5'>
            <div className="breadcrumbs text-sm text-left">
                <ul>
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to="/catalogo">Catálogo</Link></li>
                    <li>{recurso.name || recurso.nombre}</li>
                </ul>
            </div>
            <div className='mt-3'>
                <h1 className='titulos'>{recurso.name || recurso.nombre}</h1>

                <div className="tabs tabs-border text-negro">
                    <input type="radio" name="my_tabs_2" className="tab text-negro px-2" aria-label="Descripción" defaultChecked />
                    <div className="tab-content p-2 md:p-5 flex flex-col md:flex-row gap-4 ">
                        <div className="flex flex-col gap-4">
                            <h3 className="subtitulos">Descripción del {tipoRecurso}</h3>
                            <div
                                className="parrafos prose  max-w-none"
                                dangerouslySetInnerHTML={{ __html: recurso.description || recurso.descripcion || 'Sin descripción disponible' }}
                            />

                            {/* Información básica para ambos tipos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <h4 className="font-semibold mb-3">Información del {tipoRecurso}:</h4>
                                    <ul className="space-y-2 text-sm">
                                        {tipoRecurso === 'Equipo' && recurso.brand && (
                                            <>
                                                <li><strong>Marca:</strong> {recurso.brand}</li>
                                                <li><strong>Modelo:</strong> {recurso.model || 'N/A'}</li>
                                                <li><strong>Categoría:</strong> {recurso.category || 'N/A'}</li>
                                            </>
                                        )}
                                        {tipoRecurso === 'Aula' && (
                                            <li><strong>Código:</strong> {recurso.codigo}</li>
                                        )}
                                        {tipoRecurso === 'Equipo' && (
                                            <li><strong>Estado:</strong>
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${recurso.disponibilidad === 'disponible' ? 'bg-green-100 text-green-800' :
                                                    recurso.disponibilidad === 'ocupado' ? 'bg-red-100 text-red-800' :
                                                        recurso.disponibilidad === 'en mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {recurso.disponibilidad === 'disponible' ? 'Disponible' :
                                                        recurso.disponibilidad === 'ocupado' ? 'Ocupado' :
                                                            recurso.disponibilidad === 'en mantenimiento' ? 'En mantenimiento' :
                                                                'No disponible'}
                                                </span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3">Características principales:</h4>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                                        {tipoRecurso === 'Equipo' ? (
                                            <>
                                                <li>Equipo de laboratorio profesional</li>
                                                <li>Calibración certificada</li>
                                                <li>Manual de usuario incluido</li>
                                                <li>Soporte técnico disponible</li>
                                                <li>Mantenimiento regular</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Espacio equipado y funcional</li>
                                                <li>Ambiente controlado</li>
                                                <li>Capacidad para múltiples usuarios</li>
                                                <li>Equipo básico incluido</li>
                                                <li>Limpieza y mantenimiento regular</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 border-2 border-red-500">
                            <div 
                                className="cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setIsImageModalOpen(true)}
                                title="Clic para ampliar imagen"
                            >
                                <OptimizedImage
                                    src={recurso.imageUrl}
                                    alt={recurso.name}
                                    className="w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Modal para ver imagen en grande con zoom */}
                        {isImageModalOpen && (
                            <div 
                                className="fixed inset-0 bg-black/90 z-50 flex flex-col touch-none"
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                {/* Barra superior con controles */}
                                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-black/50">
                                    {/* Controles de zoom */}
                                    <div className="flex items-center gap-2 md:gap-4">
                                        <button
                                            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/10 active:bg-white/30 hover:bg-white/20 text-white text-xl md:text-2xl rounded-lg transition-colors"
                                            onClick={handleZoomOut}
                                            title="Alejar (-)"
                                        >
                                            −
                                        </button>
                                        <span className="text-white text-sm md:text-base font-medium min-w-[50px] md:min-w-[60px] text-center">
                                            {Math.round(zoomLevel * 100)}%
                                        </span>
                                        <button
                                            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/10 active:bg-white/30 hover:bg-white/20 text-white text-xl md:text-2xl rounded-lg transition-colors"
                                            onClick={handleZoomIn}
                                            title="Acercar (+)"
                                        >
                                            +
                                        </button>
                                        <button
                                            className="px-3 md:px-4 h-9 md:h-10 flex items-center justify-center bg-white/10 active:bg-white/30 hover:bg-white/20 text-white text-xs md:text-sm rounded-lg transition-colors ml-1 md:ml-2"
                                            onClick={handleResetZoom}
                                            title="Restablecer"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    
                                    {/* Botón cerrar */}
                                    <button
                                        className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/10 active:bg-red-500/80 hover:bg-red-500/80 text-white text-xl md:text-2xl rounded-lg transition-colors"
                                        onClick={closeImageModal}
                                        title="Cerrar"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Contenedor de imagen */}
                                <div 
                                    className="flex-1 flex items-center justify-center overflow-hidden"
                                    onWheel={handleWheel}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <img
                                        src={recurso.imageUrl}
                                        alt={recurso.name}
                                        className="max-w-[95vw] max-h-[80vh] md:max-w-[90vw] md:max-h-[85vh] object-contain select-none"
                                        style={{ 
                                            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                                            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                                            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                                        }}
                                        onMouseDown={handleMouseDown}
                                        draggable={false}
                                    />
                                </div>
                                
                                {/* Instrucciones en la parte inferior */}
                                <div className="py-2 text-center bg-black/50">
                                    <p className="text-white/60 text-xs md:text-sm">
                                        <span className="hidden md:inline">Rueda del mouse para zoom • </span>
                                        <span className="md:hidden">Pellizca para zoom • Doble tap para acercar • </span>
                                        {zoomLevel > 1 ? 'Arrastra para mover' : 'Haz zoom para mover'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <input type="radio" name="my_tabs_2" className="tab text-negro px-2" aria-label="Disponibilidad" />
                    <div className="tab-content mt-2 md:p-10">
                        <h3 className="subtitulos">Calendario de Disponibilidad</h3>

                        {/* Estadísticas de reservas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" >
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">{estadisticas.total || 0}</div>
                                <div className="text-sm text-blue-800">Total fechas</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">{estadisticas.disponibles || 0}</div>
                                <div className="text-sm text-green-800">Disponibles</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-red-600">{estadisticas.reservasConfirmadas || 0}</div>
                                <div className="text-sm text-red-800">Reservas</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-gray-600">{estadisticas.porcentajeOcupacion || 0}%</div>
                                <div className="text-sm text-gray-800">Ocupación</div>
                            </div>
                        </div>

                        <p className="parrafos text-sm text-gray-600 mb-6">
                            Selecciona las fechas para ver la disponibilidad {tipoRecurso === 'Equipo' ? 'del equipo' : 'del aula'}.
                            Las fechas en <span className="text-green-600 font-semibold">verde</span> están libres,
                            las fechas en <span className="text-red-600 font-semibold">rojo</span> tienen una reserva o algún horario ocupado.
                        </p>

                        <CalendarioDisponibilidad
                            resourceId={id}
                            resourceType={isAula ? 'aula' : 'equipo'}
                            reservations={reservasEquipo}
                            occupiedRanges={recurso.occupiedRanges || []}
                            onDateSelect={handleDateSelect}
                            onReserva={handleReserva}
                        />

                        {/* Detalle de horarios si la fecha seleccionada tiene reservas/ocupaciones */}
                        {selectedDate && Array.isArray(selectedDate.reservas) && selectedDate.reservas.length > 0 && (
                            <div className="w-full flex justify-center">
                                <div className="mt-4 p-4 bg-baseGris rounded-lg w-130 justify-center">
                                    <h4 className="font-semibold mb-2">Horarios para {formatISODateSafe(selectedDate.fecha)}</h4>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                        {selectedDate.reservas.map((r, idx) => {
                                            // intentar obtener horas desde diferentes propiedades
                                            const start = r.horaInicio || r.raw?.start || r.raw?.horaInicio;
                                            const end = r.horaFin || r.raw?.end || r.raw?.horaFin;
                                            const startLabel = start ? formatTime12(start) : '';
                                            const endLabel = end ? formatTime12(end) : '';

                                            return (
                                                <li key={idx} className="flex justify-between">
                                                    <span>{r.motivo || 'Ocupación'}</span>
                                                    <span className="font-mono">{startLabel} — {endLabel}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Información adicional */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold mb-2 text-blue-800">Información importante:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Las reservas deben realizarse con al menos 48 horas de anticipación</li>
                                <li>• {tipoRecurso === 'Equipo' ? 'El equipo debe ser devuelto en las mismas condiciones' : 'El aula debe dejarse limpia y ordenada'}</li>
                                <li>• Las reservas pueden cancelarse hasta 2 horas antes del uso</li>
                                {tipoRecurso === 'Aula' && <li>• Capacidad limitada según normativas de seguridad</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
