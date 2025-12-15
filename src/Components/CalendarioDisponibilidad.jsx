import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { buildUrl } from '../config/api.config';
import { API_ENDPOINTS } from '../config/endpoints.config';
import "cally";

export const CalendarioDisponibilidad = ({ 
    equipoId, 
    initialReservations = {}, 
    onDateSelect = () => {},
    onReserva = () => {} 
}) => {
    const calendarRef = useRef(null);
    const { items: reservasItems } = useSelector(state => state.reservas);
    
    const [reservations, setReservations] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

    // Función para verificar disponibilidad
    const verificarDisponibilidad = async (fecha, horaInicio = '08:00', horaFin = '18:00', cantidad = 1) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.disponibilidad), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    equipos: [{ equipo: equipoId, cantidad: cantidad }],
                    fecha: fecha,
                    horaInicio: horaInicio,
                    horaFin: horaFin
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al verificar disponibilidad');
            }

            const data = await response.json();
            return { disponible: data.disponible, mensaje: data.mensaje };
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            return { disponible: false, mensaje: error.message || 'Error al verificar disponibilidad' };
        }
    };

    // Función para hacer una reserva (redirige al formulario)
    const handleReserva = async (fecha) => {
        setIsLoading(true);
        try {
            // Verificar disponibilidad primero
            const resultado = await verificarDisponibilidad(fecha);
            
            if (!resultado.disponible) {
                alert(resultado.mensaje || 'Este equipo no está disponible en la fecha seleccionada. Por favor, elige otra fecha.');
                return;
            }
            
            // Redirigir al formulario de reserva
            onReserva(fecha, 'available');
            alert(`Redirigiendo al formulario de reserva para ${formatearFecha(fecha)}`);
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            alert('Error al verificar disponibilidad. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para actualizar la apariencia del calendario
    const updateCalendarAppearance = (calendar) => {
        setTimeout(() => {
            const dayElements = calendar.querySelectorAll('[slot="day"]');
            console.log('=== ACTUALIZANDO CALENDARIO ===');
            console.log('Total días encontrados:', dayElements.length);
            console.log('Reservas disponibles:', Object.keys(reservations).length);
            console.log('Reservas:', reservations);
            
            dayElements.forEach(dayElement => {
                const date = dayElement.getAttribute('aria-label');
                if (date) {
                    try {
                        // Limpiar estilos anteriores
                        dayElement.removeAttribute('data-status');
                        dayElement.removeAttribute('data-range-start');
                        dayElement.removeAttribute('data-range-middle');
                        dayElement.removeAttribute('data-range-end');
                        dayElement.removeAttribute('data-range-single');
                        
                        // Buscar en reservations por la fecha
                        let estado = null;
                        
                        // Intentar múltiples formatos de fecha
                        for (let key in reservations) {
                            if (date.includes(key) || key.includes(date.split(' ')[0])) {
                                estado = reservations[key];
                                console.log(`✓ Coincidencia encontrada: ${date} -> ${key}`, estado);
                                break;
                            }
                        }
                        
                        if (estado && typeof estado === 'object') {
                            const estadoStr = estado.estado || 'available';
                            dayElement.setAttribute('data-status', estadoStr);
                            
                            // Solo aplicar estilos inline si la fecha NO está seleccionada
                            const isSelected = dayElement.getAttribute('aria-selected') === 'true';
                            if (!isSelected) {
                                // Aplicar estilos directamente con !important
                                if (estadoStr === 'occupied') {
                                    dayElement.style.setProperty('background-color', '#ef4444', 'important');
                                    dayElement.style.setProperty('color', 'white', 'important');
                                    dayElement.style.setProperty('font-weight', '600', 'important');
                                } else if (estadoStr === 'available') {
                                    dayElement.style.setProperty('background-color', '#10b981', 'important');
                                    dayElement.style.setProperty('color', 'white', 'important');
                                    dayElement.style.setProperty('font-weight', '600', 'important');
                                }
                            }
                        } else {
                            // Limpiar estilos inline si la fecha NO está seleccionada
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
            
            console.log('=== FIN ACTUALIZACIÓN ===');
        }, 500);
    };

    // Cargar reservas del equipo desde Redux
    useEffect(() => {
        if (!equipoId) return;

        // Filtrar reservas que incluyan este equipo
        const reservasDelEquipo = reservasItems.filter(reserva => {
            if (!reserva.equipos || !Array.isArray(reserva.equipos)) return false;
            
            // Verificar si el equipo está en la lista de equipos de la reserva
            return reserva.equipos.some(eq => {
                const eqId = typeof eq === 'object' ? eq._id : eq;
                return eqId === equipoId;
            });
        });

        // Convertir reservas a formato de calendario
        const reservationsMap = {};
        reservasDelEquipo.forEach(reserva => {
            if (!reserva.fecha) return;
            
            // Obtener solo la fecha (YYYY-MM-DD)
            const fecha = new Date(reserva.fecha).toISOString().split('T')[0];
            
            // Marcar la fecha como ocupada si la reserva está confirmada
            if (reserva.estado === 'confirmada') {
                reservationsMap[fecha] = {
                    estado: 'occupied',
                    usuario: reserva.nombre,
                    correo: reserva.correo,
                    horaInicio: reserva.horaInicio,
                    horaFin: reserva.horaFin,
                    motivo: reserva.motivo,
                    fechaInicio: fecha,
                    fechaFin: fecha
                };
            }
        });

        setReservations(reservationsMap);
    }, [equipoId, reservasItems]);

    // Setup del calendario
    useEffect(() => {
        if (!calendarRef.current) return;

        const calendar = calendarRef.current;
        
        // Escuchar cambios de fecha
        const handleDateChange = (e) => {
            const selectedDate = e.target.value;
            setSelectedDate(selectedDate);
            
            // Buscar reserva para esa fecha
            const reserva = reservations[selectedDate];
            setReservaSeleccionada(reserva || null);
            
            // Notificar al componente padre
            onDateSelect(selectedDate, reserva);
        };

        // Escuchar cambios en el mes para re-aplicar estilos
        const handleMonthChange = () => {
            setTimeout(() => {
                updateCalendarAppearance(calendar);
            }, 100);
        };

        calendar.addEventListener('change', handleDateChange);
        calendar.addEventListener('monthchange', handleMonthChange);
        
        // Actualizar apariencia inicial
        updateCalendarAppearance(calendar);

        return () => {
            calendar.removeEventListener('change', handleDateChange);
            calendar.removeEventListener('monthchange', handleMonthChange);
        };
    }, [reservations, onDateSelect]);

    // Efecto separado para actualizar la apariencia cuando cambien las reservaciones
    useEffect(() => {
        if (calendarRef.current) {
            console.log('Reservaciones actualizadas, re-pintando calendario...', reservations);
            updateCalendarAppearance(calendarRef.current);
        }
    }, [reservations]);

    // Funciones de formateo
    const formatearFecha = (fecha) => {
        const opciones = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long' 
        };
        return new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', opciones);
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
                    {reservaSeleccionada && typeof reservaSeleccionada === 'object' ? (
                        <div className="space-y-3">
                            <p className="text-sm">
                                Estado: <span className="font-semibold text-red-600">Ocupado</span>
                            </p>
                            
                            <div className="bg-white p-3 rounded border-l-4 border-primario">
                                <h5 className="font-semibold text-sm mb-2">Información de la Reserva:</h5>
                                <div className="space-y-1 text-sm">
                                    {reservaSeleccionada.usuario && (
                                        <p><strong>Usuario:</strong> {reservaSeleccionada.usuario}</p>
                                    )}
                                    {reservaSeleccionada.correo && (
                                        <p><strong>Correo:</strong> {reservaSeleccionada.correo}</p>
                                    )}
                                    {reservaSeleccionada.horaInicio && reservaSeleccionada.horaFin && (
                                        <p><strong>Horario:</strong> {reservaSeleccionada.horaInicio} - {reservaSeleccionada.horaFin}</p>
                                    )}
                                    {reservaSeleccionada.motivo && (
                                        <p><strong>Motivo:</strong> {reservaSeleccionada.motivo}</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                Esta fecha ya está reservada. Por favor, selecciona otra fecha disponible.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600">
                                Esta fecha está disponible para reserva.
                            </p>
                            <div className="flex gap-3 mt-4">
                                <button 
                                    onClick={() => handleReserva(selectedDate)}
                                    disabled={isLoading}
                                    className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Verificando...' : 'Reservar Fecha'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};