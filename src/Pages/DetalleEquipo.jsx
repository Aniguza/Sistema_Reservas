import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { CalendarioDisponibilidad } from '../Components/CalendarioDisponibilidad'
import { getReservasEquipo, getEstadisticasReservas, agregarReserva } from '../data/dataReservas'
import { dataEquipos, dataAulas } from '../data/dataEquipos'

export const DetalleEquipo = () => {
    const { id } = useParams(); // Obtener el ID de la URL
    const equipoId = `equipo-${id}`; // Formato para las reservas
    
    // Determinar el tipo basado en la URL actual
    const currentPath = window.location.pathname;
    const isAula = currentPath.includes('/aula/');
    
    // Buscar el recurso según el tipo determinado por la URL
    let recurso, tipoRecurso;
    
    if (isAula) {
        recurso = dataAulas.find(au => au.id === parseInt(id));
        tipoRecurso = 'Aula';
    } else {
        recurso = dataEquipos.find(eq => eq.id === parseInt(id));
        tipoRecurso = 'Equipo';
    }
    
    const [reservasEquipo, setReservasEquipo] = useState({});
    const [estadisticas, setEstadisticas] = useState({});
    const [selectedDate, setSelectedDate] = useState({});    useEffect(() => {
        if (recurso) {
            // Cargar reservas del recurso (usar multimetro-1 como fallback para demo)
            const reservas = getReservasEquipo(equipoId) || getReservasEquipo('multimetro-1');
            setReservasEquipo(reservas);
            
            // Cargar estadísticas
            const stats = getEstadisticasReservas(equipoId) || getEstadisticasReservas('multimetro-1');
            setEstadisticas(stats);
        }
    }, [equipoId, recurso]);

    const handleDateSelect = (fecha) => {
        setSelectedDate(fecha);
    };

    const handleReserva = (fecha, estado) => {
        // Actualizar datos locales
        agregarReserva(equipoId, fecha, estado);
        
        // Actualizar estado del componente
        const nuevasReservas = getReservasEquipo(equipoId);
        setReservasEquipo(nuevasReservas);
        
        // Actualizar estadísticas
        const nuevasStats = getEstadisticasReservas(equipoId);
        setEstadisticas(nuevasStats);
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
        <section className='max-w-[1400px] w-full px-5 font-lato mt-5 mb-10'>
            <div className="breadcrumbs text-sm text-left">
                <ul>
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to="/catalogo">Catálogo</Link></li>
                    <li>{recurso.nombre}</li>
                </ul>
            </div>
            <div className='mt-4'>
                <h1 className='titulos'>{recurso.nombre}</h1>
                
                <div className="tabs tabs-border text-negro">
                    <input type="radio" name="my_tabs_2" className="tab text-negro" aria-label="Descripción" defaultChecked />
                    <div className="tab-content p-10">
                        <h3 className="subtitulos">Descripción del {tipoRecurso}</h3>
                        <p className="parrafos">
                            {recurso.descripcion}
                        </p>
                        
                        {/* Información básica para ambos tipos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h4 className="font-semibold mb-3">Información del {tipoRecurso}:</h4>
                                <ul className="space-y-2 text-sm">
                                    {tipoRecurso === 'Equipo' && recurso.especificaciones && (
                                        <>
                                            <li><strong>Marca:</strong> {recurso.especificaciones.marca}</li>
                                            <li><strong>Modelo:</strong> {recurso.especificaciones.modelo}</li>
                                            <li><strong>Año:</strong> {recurso.especificaciones.año}</li>
                                        </>
                                    )}
                                    <li><strong>Ubicación:</strong> {recurso.ubicacion}</li>
                                    {tipoRecurso === 'Equipo' && (
                                        <li><strong>Estado:</strong> 
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                                                recurso.disponibilidad 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {recurso.disponibilidad ? 'Disponible' : 'No Disponible'}
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

                    {/* Pestaña de especificaciones solo para equipos */}
                    {tipoRecurso === 'Equipo' && (
                        <>
                            <input type="radio" name="my_tabs_2" className="tab text-negro" aria-label="Especificaciones" />
                            <div className="tab-content p-10">
                                <h3 className="subtitulos">Especificaciones Técnicas</h3>
                                
                                {recurso.especificaciones ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="bg-baseGris p-4 rounded-lg">
                                            <h4 className="font-semibold mb-3 text-primario">Información General</h4>
                                            <ul className="space-y-1 text-sm">
                                                <li><strong>Marca:</strong> {recurso.especificaciones.marca}</li>
                                                <li><strong>Modelo:</strong> {recurso.especificaciones.modelo}</li>
                                                <li><strong>Año de fabricación:</strong> {recurso.especificaciones.año}</li>
                                                <li><strong>Estado:</strong> Operativo</li>
                                            </ul>
                                        </div>
                                        
                                        <div className="bg-baseGris p-4 rounded-lg">
                                            <h4 className="font-semibold mb-3 text-primario">Características Técnicas</h4>
                                            <ul className="space-y-1 text-sm">
                                                <li><strong>Tipo:</strong> Equipo de laboratorio</li>
                                                <li><strong>Precisión:</strong> Alta</li>
                                                <li><strong>Calibración:</strong> Vigente</li>
                                                <li><strong>Certificación:</strong> ISO 9001</li>
                                            </ul>
                                        </div>
                                        
                                        <div className="bg-baseGris p-4 rounded-lg">
                                            <h4 className="font-semibold mb-3 text-primario">Condiciones de Uso</h4>
                                            <ul className="space-y-1 text-sm">
                                                <li><strong>Temperatura:</strong> 15-25°C</li>
                                                <li><strong>Humedad:</strong> &lt; 70% RH</li>
                                                <li><strong>Alimentación:</strong> 220V AC</li>
                                                <li><strong>Ubicación:</strong> Laboratorio</li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No hay especificaciones técnicas disponibles para este equipo.</p>
                                    </div>
                                )}
                                
                                <div className="mt-6 bg-baseGris p-4 rounded-lg">
                                    <h4 className="font-semibold mb-3 text-primario">Notas Importantes</h4>
                                    <div className="text-sm text-gray-700 space-y-2">
                                        <p>• Este equipo requiere capacitación previa para su uso seguro</p>
                                        <p>• Debe ser operado únicamente por personal autorizado</p>
                                        <p>• Seguir estrictamente las instrucciones del manual de usuario</p>
                                        <p>• Reportar cualquier anomalía inmediatamente al personal técnico</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <input type="radio" name="my_tabs_2" className="tab text-negro" aria-label="Disponibilidad" />
                    <div className="tab-content p-10">
                        <h3 className="subtitulos">Calendario de Disponibilidad</h3>
                        
                        {/* Estadísticas de reservas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">{estadisticas.total || 0}</div>
                                <div className="text-sm text-blue-800">Total fechas</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">{estadisticas.disponibles || 0}</div>
                                <div className="text-sm text-green-800">Disponibles</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-red-600">{estadisticas.ocupadas || 0}</div>
                                <div className="text-sm text-red-800">Ocupadas</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-gray-600">{estadisticas.porcentajeOcupacion || 0}%</div>
                                <div className="text-sm text-gray-800">Ocupación</div>
                            </div>
                        </div>
                        
                        <p className="parrafos text-sm text-gray-600 mb-6">
                            Selecciona las fechas para ver la disponibilidad {tipoRecurso === 'Equipo' ? 'del equipo' : 'del aula'}. 
                            Las fechas en <span className="text-green-600 font-semibold">verde</span> están disponibles, 
                            las fechas en <span className="text-red-600 font-semibold">rojo</span> están ocupadas.
                            Puedes hacer una reserva directamente desde el calendario.
                        </p>
                        
                        <CalendarioDisponibilidad
                            equipoId={equipoId}
                            initialReservations={reservasEquipo}
                            onDateSelect={handleDateSelect}
                            onReserva={handleReserva}
                        />
                        
                        {/* Información adicional */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold mb-2 text-blue-800">Información importante:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Las reservas deben realizarse con al menos 24 horas de anticipación</li>
                                <li>• {tipoRecurso === 'Equipo' ? 'El equipo debe ser devuelto en las mismas condiciones' : 'El aula debe dejarse limpia y ordenada'}</li>
                                {tipoRecurso === 'Equipo' && <li>• Se requiere capacitación previa para el uso del equipo</li>}
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
