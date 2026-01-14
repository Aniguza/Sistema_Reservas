import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReservasByUser, cancelarReserva } from '../redux/slices/reservasSlice';
import { useToast } from '../Context/ToastContext';
import { FaEye, FaExclamationTriangle, FaHistory, FaTimes } from 'react-icons/fa';

export const MisReservas = () => {
    const dispatch = useDispatch();
    const { showToast } = useToast();
    const { userReservas: reservas, isLoading } = useSelector(state => state.reservas);
    const [filtroEstado, setFiltroEstado] = useState('Todas');
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [reservaACancelar, setReservaACancelar] = useState(null);
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const detalleModalRef = useRef(null);
    const cancelarModalRef = useRef(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const correo = user.correo;
        
        if (!correo) {
            showToast('No se encontró información del usuario', 'error');
            return;
        }

        // Solo cargar si no hay reservas en el estado
        if (!reservas || reservas.length === 0) {
            dispatch(fetchReservasByUser(correo));
        }
    }, [dispatch]);

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const obtenerColorEstado = (estado) => {
        const estados = {
            'confirmada': 'bg-green-100 text-green-800 border-green-300',
            'cancelada': 'bg-red-100 text-red-800 border-red-300',
            'cerrada': 'bg-gray-100 text-gray-800 border-gray-300',
            'cerrada_con_incidencia': 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
        return estados[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const formatearEstado = (estado) => {
        const estados = {
            'confirmada': 'Confirmada',
            'cancelada': 'Cancelada',
            'cerrada': 'Cerrada',
            'cerrada_con_incidencia': 'Cerrada con Incidencia'
        };
        return estados[estado] || estado;
    };

    const reservasFiltradas = filtroEstado === 'Todas' 
        ? reservas 
        : reservas.filter(reserva => reserva.estado === filtroEstado);

    const abrirDetalles = (reserva) => {
        setReservaSeleccionada(reserva);
        detalleModalRef.current?.showModal();
    };

    // Verificar si el usuario puede cancelar reservas (solo alumnos, docentes y administradores)
    const puedeCancelarReservas = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const rol = (user.rol || user.role || '').toLowerCase();
        return ['alumno', 'docente', 'administrador'].includes(rol);
    };

    // Verificar si una reserva puede ser cancelada (solo si no está ya cancelada, cerrada o cerrada con incidencia)
    const puedeCancelarReserva = (reserva) => {
        return reserva.estado !== 'cancelada' && reserva.estado !== 'cerrada' && reserva.estado !== 'cerrada_con_incidencia';
    };

    const abrirModalCancelar = (reserva) => {
        setReservaACancelar(reserva);
        setMotivoCancelacion('');
        cancelarModalRef.current?.showModal();
    };

    const confirmarCancelacion = async () => {
        if (!reservaACancelar || !motivoCancelacion.trim()) {
            showToast('Por favor ingrese un motivo para la cancelación', 'error');
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const rol = (user.rol || user.role || '').toLowerCase();
            const isAdmin = rol === 'administrador';

            await dispatch(cancelarReserva({
                id: reservaACancelar._id,
                motivo: motivoCancelacion.trim(),
                isAdmin,
                correoUsuario: user.correo
            }));

            showToast('Reserva cancelada exitosamente', 'success');
            cancelarModalRef.current?.close();

            // Recargar las reservas del usuario
            dispatch(fetchReservasByUser(user.correo));

        } catch (error) {
            showToast('Error al cancelar la reserva', 'error');
        }
    };

    const isLoggedIn = !!localStorage.getItem('access_token');

    if (!isLoggedIn) {
        return (
            <section className='max-w-[1400px] w-full px-5 font-lato mt-5 mb-10'>
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold text-gray-600 mb-4">Acceso denegado</h1>
                    <p className="text-gray-500 mb-6">Debes iniciar sesión para ver tus reservas.</p>
                    <Link to="/login" className="btn bg-primario text-white hover:bg-red-700">
                        Iniciar Sesión
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
                    <li>Mis Reservas</li>
                </ul>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className='titulos'>Mis Reservas</h1>
                <select 
                    className="select select-bordered"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="Todas">Todas</option>
                    <option value="confirmada">Confirmadas</option>
                    <option value="cancelada">Canceladas</option>
                    <option value="cerrada">Cerradas</option>
                    <option value="cerrada_con_incidencia">Con Incidencia</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <span className="loading loading-spinner loading-lg text-primario"></span>
                </div>
            ) : reservasFiltradas.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">
                        {filtroEstado === 'Todas' ? 'No tienes reservas' : `No tienes reservas ${formatearEstado(filtroEstado).toLowerCase()}`}
                    </h2>
                    <p className="text-gray-500 mb-6">Comienza a reservar equipos y aulas para tus prácticas.</p>
                    <Link to="/catalogo" className="btn bg-primario text-white hover:bg-red-700">
                        Ver Catálogo
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {reservasFiltradas.map((reserva) => (
                        <div key={reserva._id} className="card bg-base-100 shadow-lg border hover:shadow-xl transition-shadow">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <h2 className="card-title text-lg">{
                                                (() => {
                                                    let motivo = reserva.motivo || 'Reserva';
                                                    // Remover el texto [CANCELADA: xxx] si existe
                                                    motivo = motivo.replace(/\[CANCELADA:\s*[^\]]*\]\s*/gi, '');
                                                    return motivo.trim() || 'Reserva';
                                                })()
                                            }</h2>
                                            <span className={`badge ${obtenerColorEstado(reserva.estado)} border px-3 py-3 text-xs font-semibold`}>
                                                {formatearEstado(reserva.estado)}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">
                                                <strong>📅 Fecha:</strong> {formatearFecha(reserva.fecha)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>🕐 Horario:</strong> {reserva.horaInicio} - {reserva.horaFin}
                                            </p>
                                        </div>

                                        {/* Indicadores de incidencias y reprogramaciones */}
                                        <div className="flex gap-2 mt-4">
                                            {reserva.incidencias && reserva.incidencias.length > 0 && (
                                                <div className="badge badge-warning gap-1 text-xs">
                                                    <FaExclamationTriangle className="w-3 h-3" />
                                                    {reserva.incidencias.length} Incidencia{reserva.incidencias.length > 1 ? 's' : ''}
                                                </div>
                                            )}
                                            {reserva.reprogramaciones && reserva.reprogramaciones.length > 0 && (
                                                <div className="badge badge-info gap-1 text-xs">
                                                    <FaHistory className="w-3 h-3" />
                                                    {reserva.reprogramaciones.length} Reprogramación{reserva.reprogramaciones.length > 1 ? 'es' : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex gap-2">
                                        {/* Botón para ver detalles */}
                                        <button
                                            onClick={() => abrirDetalles(reserva)}
                                            className="btn btn-circle btn-ghost btn-sm"
                                            title="Ver detalles completos"
                                        >
                                            <FaEye className="w-5 h-5 text-gray-600 hover:text-primario" />
                                        </button>

                                        {/* Botón para cancelar reserva */}
                                        {puedeCancelarReservas() && puedeCancelarReserva(reserva) && (
                                            <button
                                                onClick={() => abrirModalCancelar(reserva)}
                                                className="btn btn-circle btn-ghost btn-sm text-red-600 hover:text-red-800 hover:bg-red-50"
                                                title="Cancelar reserva"
                                            >
                                                <FaTimes className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de detalles */}
            <dialog ref={detalleModalRef} className="modal">
                <div className="modal-box w-11/12 max-w-3xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    
                    {reservaSeleccionada && (
                        <>
                            <h3 className="font-bold text-xl mb-4">Detalles de la Reserva</h3>
                            
                            <div className="space-y-4">
                                {/* Estado */}
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold">Estado:</span>
                                    <span className={`badge ${obtenerColorEstado(reservaSeleccionada.estado)} border px-4 py-3`}>
                                        {formatearEstado(reservaSeleccionada.estado)}
                                    </span>
                                </div>

                                {/* Información básica */}
                                <div className="bg-base-200 p-4 rounded-lg space-y-2">
                                    <h4 className="font-semibold mb-2">Información General</h4>
                                    <p  className="text-sm"><strong>Código:</strong> {reservaSeleccionada.codigo}</p>
                                    <p className="text-sm"><strong>Motivo:</strong> {
                                        (() => {
                                            let motivo = reservaSeleccionada.motivo || 'Sin especificar';
                                            // Remover el texto [CANCELADA: xxx] si existe
                                            motivo = motivo.replace(/\[CANCELADA:\s*[^\]]*\]\s*/gi, '');
                                            return motivo.trim() || 'Sin especificar';
                                        })()
                                    }</p>
                                    <p className="text-sm"><strong>Fecha:</strong> {formatearFecha(reservaSeleccionada.fecha)}</p>
                                    <p className="text-sm"><strong>Horario:</strong> {reservaSeleccionada.horaInicio} - {reservaSeleccionada.horaFin}</p>
                                    <p className="text-sm"><strong>Tipo:</strong> {reservaSeleccionada.tipo === 'equipo' ? 'Equipo' : 'Aula'}</p>
                                    <p className="text-sm"><strong>Responsable:</strong> {reservaSeleccionada.nombre}</p>
                                    <p className="text-sm"><strong>Correo:</strong> {reservaSeleccionada.correo}</p>
                                </div>

                                {/* Motivo de cancelación */}
                                {reservaSeleccionada.estado === 'cancelada' && (() => {
                                    // Extraer el motivo de cancelación del campo motivo si existe [CANCELADA: xxx]
                                    const match = reservaSeleccionada.motivo?.match(/\[CANCELADA:\s*([^\]]+)\]/i);
                                    return match ? match[1].trim() : reservaSeleccionada.motivoCancelacion;
                                })() && (
                                    <div className="bg-red-50 border border-red-300 p-4 rounded-lg">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-800">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            Información de Cancelación
                                        </h4>
                                        <div className="bg-white p-3 rounded border border-red-200">
                                            <p className="text-sm text-gray-600 mb-2">
                                                <strong>Motivo:</strong> {
                                                    (() => {
                                                        const match = reservaSeleccionada.motivo?.match(/\[CANCELADA:\s*([^\]]+)\]/i);
                                                        return match ? match[1].trim() : reservaSeleccionada.motivoCancelacion;
                                                    })()
                                                }
                                            </p>
                                            {reservaSeleccionada.fechaCancelacion && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Fecha de cancelación:</strong> {formatearFecha(reservaSeleccionada.fechaCancelacion)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Equipos */}
                                {reservaSeleccionada.equipos && reservaSeleccionada.equipos.length > 0 && (
                                    <div className="bg-base-200 p-4 rounded-lg">
                                        <h4 className="font-semibold mb-2">Equipos Reservados</h4>
                                        <ul className="space-y-1">
                                            {reservaSeleccionada.equipos.map((equipo, index) => (
                                                <li key={index} className="text-sm flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-primario rounded-full"></span>
                                                    {equipo.nombre || 'Equipo'}
                                                    {equipo.cantidad > 1 && (
                                                        <span className="badge badge-sm badge-primary">x{equipo.cantidad}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Aulas */}
                                {reservaSeleccionada.aulas && reservaSeleccionada.aulas.length > 0 && (
                                    <div className="bg-base-200 p-4 rounded-lg">
                                        <h4 className="font-semibold mb-2">Aulas Asignadas</h4>
                                        <ul className="space-y-1">
                                            {reservaSeleccionada.aulas.map((aula, index) => (
                                                <li key={index} className="text-sm">
                                                    • {aula.name} ({aula.codigo})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Compañeros */}
                                {reservaSeleccionada.companeros && reservaSeleccionada.companeros.length > 0 && (
                                    <div className="bg-base-200 p-4 rounded-lg">
                                        <h4 className="font-semibold mb-2">Compañeros ({reservaSeleccionada.companeros.length})</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {reservaSeleccionada.companeros.map((companero, index) => {
                                                const codigo = typeof companero === 'object' ? companero.codigo : companero;
                                                const nombre = typeof companero === 'object' ? companero.nombre : '';
                                                return (
                                                    <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border">
                                                        <span className="badge badge-primary badge-sm">{codigo}</span>
                                                        {nombre && <span className="text-sm text-gray-700">{nombre}</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Incidencias */}
                                {reservaSeleccionada.incidencias && reservaSeleccionada.incidencias.length > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-800">
                                            <FaExclamationTriangle />
                                            Incidencias Reportadas
                                        </h4>
                                        <div className="space-y-3">
                                            {reservaSeleccionada.incidencias.map((incidencia, index) => (
                                                <div key={index} className="bg-white p-3 rounded border border-yellow-200">
                                                    <p className="text-sm text-gray-700">{incidencia.descripcion || incidencia}</p>
                                                    {incidencia.fecha && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Reportada: {formatearFecha(incidencia.fecha)}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reprogramaciones */}
                                {reservaSeleccionada.reprogramaciones && reservaSeleccionada.reprogramaciones.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-800">
                                            <FaHistory />
                                            Historial de Reprogramaciones
                                        </h4>
                                        <div className="space-y-3">
                                            {reservaSeleccionada.reprogramaciones.map((reprog, index) => (
                                                <div key={index} className="bg-white p-3 rounded border border-blue-200">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <p className="font-medium text-gray-600">Fecha anterior:</p>
                                                            <p>{formatearFecha(reprog.fechaAnterior)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-600">Nueva fecha:</p>
                                                            <p>{formatearFecha(reprog.fechaNueva)}</p>
                                                        </div>
                                                    </div>
                                                    {reprog.motivo && (
                                                        <p className="text-xs text-gray-600 mt-2">
                                                            <strong>Motivo:</strong> {reprog.motivo}
                                                        </p>
                                                    )}
                                                    {reprog.fecha && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatearFecha(reprog.fecha)}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fechas de creación y actualización */}
                                <div className="text-xs text-gray-500 pt-2 border-t">
                                    <p>Creada: {formatearFecha(reservaSeleccionada.createdAt)}</p>
                                    {reservaSeleccionada.updatedAt && reservaSeleccionada.updatedAt !== reservaSeleccionada.createdAt && (
                                        <p>Última actualización: {formatearFecha(reservaSeleccionada.updatedAt)}</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>cerrar</button>
                </form>
            </dialog>

            {/* Modal de cancelación */}
            <dialog ref={cancelarModalRef} className="modal">
                <div className="modal-box w-11/12 max-w-md">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>

                    <h3 className="font-bold text-lg mb-4 text-red-600">Cancelar Reserva</h3>

                    {reservaACancelar && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium">Reserva:</p>
                                <p className="text-sm text-gray-700">
                                    {(() => {
                                        let motivo = reservaACancelar.motivo || 'Reserva';
                                        motivo = motivo.replace(/\[CANCELADA:\s*[^\]]*\]\s*/gi, '');
                                        return motivo.trim() || 'Reserva';
                                    })()}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    📅 {formatearFecha(reservaACancelar.fecha)} • 🕐 {reservaACancelar.horaInicio} - {reservaACancelar.horaFin}
                                </p>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Motivo de cancelación *</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered h-24 resize-none"
                                    placeholder="Ingrese el motivo por el cual desea cancelar esta reserva..."
                                    value={motivoCancelacion}
                                    onChange={(e) => setMotivoCancelacion(e.target.value)}
                                    required
                                />
                                <label className="label">
                                    <span className="label-text-alt text-gray-500">Este campo es obligatorio</span>
                                </label>
                            </div>

                            <div className="alert alert-warning">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="text-sm">Esta acción no se puede deshacer. Se enviará una notificación por correo electrónico.</span>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => cancelarModalRef.current?.close()}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-error"
                                    onClick={confirmarCancelacion}
                                    disabled={!motivoCancelacion.trim() || isLoading}
                                >
                                    {isLoading ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        'Confirmar Cancelación'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>cerrar</button>
                </form>
            </dialog>
        </section>
    );
};
