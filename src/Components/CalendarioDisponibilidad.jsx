import React, { useState, useEffect, useRef } from 'react';
import { getReservasEquipo, agregarReserva, eliminarReserva } from '../data/dataReservas';
import "cally";

export const CalendarioDisponibilidad = ({ 
    equipoId, 
    initialReservations = {}, 
    onDateSelect = () => {},
    onReserva = () => {} 
}) => {
    const calendarRef = useRef(null);
    
    const [reservations, setReservations] = useState(initialReservations);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

    // Función para actualizar la apariencia del calendario
    const updateCalendarAppearance = (calendar) => {
        setTimeout(() => {
            const dayElements = calendar.querySelectorAll('[slot="day"]');
            console.log('Actualizando calendario con reservas:', reservations); // Debug
            
            dayElements.forEach(dayElement => {
                const date = dayElement.getAttribute('aria-label');
                if (date) {
                    try {
                        // Usar directamente la fecha sin conversiones de zona horaria
                        const dateString = date;
                        
                        // Limpiar estilos anteriores
                        dayElement.removeAttribute('data-status');
                        dayElement.removeAttribute('data-range-start');
                        dayElement.removeAttribute('data-range-middle');
                        dayElement.removeAttribute('data-range-end');
                        dayElement.removeAttribute('data-range-single');
                        
                        // Aplicar estado según reservations
                        const estado = reservations[dateString];
                        console.log(`Fecha ${dateString}:`, estado); // Debug
                        
                        if (estado) {
                            dayElement.setAttribute('data-status', estado);
                            console.log(`Aplicando estado ${estado} a fecha ${dateString}`); // Debug
                            
                            // Solo aplicar estilos inline si la fecha NO está seleccionada
                            const isSelected = dayElement.getAttribute('aria-selected') === 'true';
                            if (!isSelected) {
                                // Aplicar estilos directamente como fallback
                                if (estado === 'occupied') {
                                    dayElement.style.backgroundColor = '#ef4444';
                                    dayElement.style.color = 'white';
                                    dayElement.style.fontWeight = '600';
                                } else if (estado === 'available') {
                                    dayElement.style.backgroundColor = '#10b981';
                                    dayElement.style.color = 'white';
                                    dayElement.style.fontWeight = '600';
                                }
                            }
                        } else {
                            // Solo limpiar estilos inline si la fecha NO está seleccionada
                            const isSelected = dayElement.getAttribute('aria-selected') === 'true';
                            if (!isSelected) {
                                dayElement.style.backgroundColor = '';
                                dayElement.style.color = '';
                                dayElement.style.fontWeight = '';
                            }
                        }
                    } catch (error) {
                        console.warn('Error parsing date:', date, error);
                    }
                }
            });
        }, 500); // Aumentar el timeout para dar más tiempo al calendario
    };

    // Configurar calendario
    useEffect(() => {
        // Actualizar las reservations cuando cambien las initialReservations
        setReservations(initialReservations);
    }, [initialReservations]);

    useEffect(() => {
        const setupCalendar = (calendarRef) => {
            if (calendarRef.current) {
                const calendar = calendarRef.current;
                
                // Escuchar cambios de fecha
                const handleDateChange = (e) => {
                    const selectedDate = e.target.value;
                    setSelectedDate(selectedDate);
                    
                    // Obtener información de la reserva para esa fecha
                    const estado = reservations[selectedDate];
                    setReservaSeleccionada(estado ? { estado, fecha: selectedDate } : null);
                    
                    onDateSelect(selectedDate);
                };

                calendar.addEventListener('change', handleDateChange);
                
                // Configurar apariencia inicial
                updateCalendarAppearance(calendar);

                // Cleanup
                return () => {
                    calendar.removeEventListener('change', handleDateChange);
                };
            }
        };

        const cleanup = setupCalendar(calendarRef);

        return () => {
            cleanup?.();
        };
    }, [reservations, onDateSelect, equipoId]);

    // Efecto separado para actualizar la apariencia cuando cambien las reservaciones
    useEffect(() => {
        if (calendarRef.current) {
            updateCalendarAppearance(calendarRef.current);
        }
    }, [reservations]);

    // Función para hacer una reserva
    const handleReserva = async (fecha) => {
        setIsLoading(true);
        try {
            // Agregar la reserva usando la función global
            await agregarReserva(equipoId, fecha, 'occupied');
            
            // Actualizar estado local
            setReservations(prev => ({
                ...prev,
                [fecha]: 'occupied'
            }));

            // Callback para el componente padre
            onReserva(fecha, 'occupied');
            
            alert(`Reserva confirmada para ${fecha}`);
        } catch (error) {
            console.error('Error al hacer la reserva:', error);
            alert('Error al realizar la reserva. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para cancelar una reserva (si es necesario)
    const handleCancelarReserva = async (fecha) => {
        setIsLoading(true);
        try {
            // Eliminar la reserva usando la función global
            eliminarReserva(equipoId, fecha);
            
            // Actualizar estado local
            setReservations(prev => {
                const newReservations = { ...prev };
                delete newReservations[fecha];
                return newReservations;
            });

            onReserva(fecha, null);
            setReservaSeleccionada(null);
            
            alert(`Reserva cancelada para ${fecha}`);
        } catch (error) {
            console.error('Error al cancelar la reserva:', error);
            alert('Error al cancelar la reserva. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatearFecha = (fecha) => {
        const opciones = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long' 
        };
        // Usar la fecha directamente agregando hora local para evitar cambios de zona horaria
        return new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', opciones);
    };

    const formatearRangoFecha = (fechaInicio, fechaFin) => {
        if (fechaInicio === fechaFin) {
            return formatearFecha(fechaInicio);
        }
        
        const inicio = new Date(fechaInicio + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        const fin = new Date(fechaFin + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        
        return `${inicio} - ${fin}`;
    };

    return (
        <div className="calendario-disponibilidad">
            <div className="calendar-container flex justify-center mb-6">
                <div className="calendar-wrapper">
                    <calendar-date 
                        ref={calendarRef}
                        className="cally border border-base-300 shadow-lg rounded-box"
                        value={new Date().toISOString().split('T')[0]}
                    >
                        <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                        </svg>
                        <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                        </svg>
                        <calendar-month></calendar-month>
                    </calendar-date>
                </div>
            </div>

            {/* Leyenda del calendario */}
            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color legend-available"></div>
                    <span>Disponible</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color legend-occupied"></div>
                    <span>Ocupado</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color legend-selected"></div>
                    <span>Seleccionado</span>
                </div>
            </div>

            {/* Información de la fecha seleccionada */}
            {selectedDate && (
                <div className="mt-6 p-4 bg-baseGris rounded-lg">
                    <h4 className="font-semibold mb-2">
                        Fecha seleccionada: {formatearFecha(selectedDate)}
                    </h4>
                    
                    {reservaSeleccionada ? (
                        <div className="space-y-3">
                            <p className="text-sm">
                                Estado: <span className={`font-semibold ${
                                    reservaSeleccionada.estado === 'occupied' ? 'text-red-600' :
                                    reservaSeleccionada.estado === 'available' ? 'text-green-600' :
                                    'text-gray-600'
                                }`}>
                                    {reservaSeleccionada.estado === 'occupied' ? 'Ocupado' :
                                     reservaSeleccionada.estado === 'available' ? 'Disponible' :
                                     'Sin definir'}
                                </span>
                            </p>
                            
                            {reservaSeleccionada.fechaInicio && reservaSeleccionada.fechaFin && (
                                <div className="bg-white p-3 rounded border-l-4 border-primario">
                                    <h5 className="font-semibold text-sm mb-2">Información de la Reserva:</h5>
                                    <div className="space-y-1 text-sm">
                                        <p><strong>Período:</strong> {formatearRangoFecha(reservaSeleccionada.fechaInicio, reservaSeleccionada.fechaFin)}</p>
                                        {reservaSeleccionada.usuario && (
                                            <p><strong>Usuario:</strong> {reservaSeleccionada.usuario}</p>
                                        )}
                                        {reservaSeleccionada.proposito && (
                                            <p><strong>Propósito:</strong> {reservaSeleccionada.proposito}</p>
                                        )}
                                        {reservaSeleccionada.fechaInicio !== reservaSeleccionada.fechaFin && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Esta fecha forma parte de una reserva del {new Date(reservaSeleccionada.fechaInicio + 'T12:00:00').toLocaleDateString('es-ES')} 
                                                al {new Date(reservaSeleccionada.fechaFin + 'T12:00:00').toLocaleDateString('es-ES')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600">
                            Esta fecha no tiene reservas programadas.
                        </p>
                    )}
                    
                    <div className="flex gap-3 mt-4">
                        {reservaSeleccionada?.estado === 'available' && (
                            <button 
                                onClick={() => handleReserva(selectedDate)}
                                disabled={isLoading}
                                className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Procesando...' : 'Hacer Reserva'}
                            </button>
                        )}
                        
                        {reservaSeleccionada?.estado === 'occupied' && (
                            <button 
                                onClick={() => handleCancelarReserva(selectedDate)}
                                disabled={isLoading}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Procesando...' : 'Cancelar Reserva'}
                            </button>
                        )}
                        
                        {!reservaSeleccionada && (
                            <button 
                                onClick={() => handleReserva(selectedDate)}
                                disabled={isLoading}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Procesando...' : 'Reservar Fecha'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};