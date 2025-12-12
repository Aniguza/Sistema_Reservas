import React, { useEffect } from 'react'
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaEnvelope, FaIdCard, FaPhone, FaUserTag, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { fetchUserProfile } from '../redux/slices/authSlice';
import { useToast } from '../Context/ToastContext';

export const Perfil = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user: usuarioActual, isLoading } = useSelector(state => state.auth);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.correo;
    
    if (!userEmail) {
      showToast('No se encontró información del usuario', 'error');
      return;
    }

    // Solo cargar si no hay datos del usuario o si están incompletos
    if (!usuarioActual || !usuarioActual.estadisticas) {
      dispatch(fetchUserProfile(userEmail));
    }
  }, [dispatch]);
  
  if (isLoading) {
    return (
      <section className='max-w-[1400px] w-full px-5 font-lato mt-5 mb-10'>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primario mb-4"></div>
            <p className="text-gray-600">Cargando información del usuario...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!usuarioActual) {
    return (
      <section className='max-w-[1400px] w-full px-5 font-lato mt-5 mb-10'>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-gray-600">No se pudo cargar la información del perfil</p>
            <Link to="/" className="btn btn-primary mt-4">Volver al inicio</Link>
          </div>
        </div>
      </section>
    );
  }

  // Obtener iniciales para el avatar del primer nombre y apellido
  const obtenerIniciales = (nombreCompleto) => {
    const palabras = nombreCompleto.split(' ');
    if (palabras.length >= 3) {
      // Primera letra del nombre (posición 0) y primera letra del primer apellido (posición 2)
      return (palabras[0][0] + palabras[2][0]).toUpperCase();
    } else if (palabras.length === 2) {
      // Si solo hay 2 palabras, tomar ambas
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    } else {
      // Si solo hay 1 palabra, tomar la primera letra
      return palabras[0][0].toUpperCase();
    }
  };
  
  const iniciales = obtenerIniciales(usuarioActual.nombre || usuarioActual.name || 'U');
  
  return (
    <section className='max-w-[1400px] w-full px-5 font-lato mt-5 mb-10'>
      <div className="breadcrumbs text-sm text-left mb-4">
        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li>Mi Perfil</li>
        </ul>
      </div>

      <h1 className='titulos mb-6'>Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de perfil principal */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl border">
            <div className="card-body items-center text-center">
              {/* Avatar */}
              <div className="avatar placeholder mb-4">
                <div className="flex items-center justify-center bg-primario text-white rounded-full w-32 h-32">
                  <span className="text-6xl font-bold ">{iniciales}</span>
                </div>
              </div>
              
              <h2 className="card-title text-2xl">{usuarioActual.nombre || usuarioActual.name}</h2>
              <p className="text-gray-600">{usuarioActual.correo || usuarioActual.email}</p>
              
              <div className="divider my-2"></div>
              
              <div className="badge badge-lg badge-primary">
                {usuarioActual.rol || usuarioActual.role || 'Usuario'}
              </div>

              {usuarioActual.codigo && (
                <div className="mt-4">
                  <div className="badge badge-outline badge-lg">
                    Código: {usuarioActual.codigo}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl border">
            <div className="card-body">
              <h3 className="card-title text-xl mb-4">Información Personal</h3>
              
              <div className="space-y-4">
                {/* Nombre */}
                <div className="flex items-start gap-4 p-4 bg-base-200 rounded-lg">
                  <div className="mt-1">
                    <FaUser className="w-5 h-5 text-primario" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-semibold">Nombre Completo</p>
                    <p className="text-base">{usuarioActual.nombre || usuarioActual.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-4 bg-base-200 rounded-lg">
                  <div className="mt-1">
                    <FaEnvelope className="w-5 h-5 text-primario" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-semibold">Correo Electrónico</p>
                    <p className="text-base">{usuarioActual.correo || usuarioActual.email}</p>
                  </div>
                </div>

                {/* Código */}
                {usuarioActual.codigo && (
                  <div className="flex items-start gap-4 p-4 bg-base-200 rounded-lg">
                    <div className="mt-1">
                      <FaIdCard className="w-5 h-5 text-primario" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-semibold">Código Universitario</p>
                      <p className="text-base">{usuarioActual.codigo}</p>
                    </div>
                  </div>
                )}

                {/* Teléfono */}
                {usuarioActual.telefono && (
                  <div className="flex items-start gap-4 p-4 bg-base-200 rounded-lg">
                    <div className="mt-1">
                      <FaPhone className="w-5 h-5 text-primario" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-semibold">Teléfono</p>
                      <p className="text-base">{usuarioActual.telefono}</p>
                    </div>
                  </div>
                )}

                {/* Rol */}
                <div className="flex items-start gap-4 p-4 bg-base-200 rounded-lg">
                  <div className="mt-1">
                    <FaUserTag className="w-5 h-5 text-primario" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-semibold">Rol en el Sistema</p>
                    <p className="text-base capitalize">{usuarioActual.rol || usuarioActual.role || 'Usuario'}</p>
                  </div>
                </div>

                {/* Carrera */}
                {usuarioActual.carrera && (
                  <div className="flex items-start gap-4 p-4 bg-base-200 rounded-lg">
                    <div className="mt-1">
                      <FaCalendarAlt className="w-5 h-5 text-primario" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-semibold">Carrera</p>
                      <p className="text-base">{usuarioActual.carrera}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="divider"></div>

              {/* Acciones rápidas */}
              <div className="flex flex-wrap gap-3 mt-4">
                <Link to="/mis-reservas" className="btn btn-outline btn-primary">
                  Ver mis reservas
                </Link>
                <Link to="/reservas" className="btn btn-primary">
                  Nueva reserva
                </Link>
              </div>
            </div>
          </div>

          {/* Estadísticas de reservas */}
          {usuarioActual.estadisticas && (
            <div className="card bg-base-100 shadow-xl border mt-6">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4 flex items-center gap-2">
                  <FaChartLine className="text-primario" />
                  Mis Estadísticas
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Total reservas */}
                  <div className="stat bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="stat-title text-xs text-gray-600">Total</div>
                    <div className="stat-value text-2xl text-blue-600">{usuarioActual.estadisticas.totalReservas}</div>
                    <div className="stat-desc text-xs">Reservas totales</div>
                  </div>

                  {/* Reservas activas */}
                  <div className="stat bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="stat-title text-xs text-gray-600">Activas</div>
                    <div className="stat-value text-2xl text-green-600">{usuarioActual.estadisticas.reservasActivas}</div>
                    <div className="stat-desc text-xs">En curso</div>
                  </div>

                  {/* Reservas pasadas */}
                  <div className="stat bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="stat-title text-xs text-gray-600">Pasadas</div>
                    <div className="stat-value text-2xl text-gray-600">{usuarioActual.estadisticas.reservasPasadas}</div>
                    <div className="stat-desc text-xs">Completadas</div>
                  </div>

                  {/* Reservas canceladas */}
                  <div className="stat bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="stat-title text-xs text-gray-600">Canceladas</div>
                    <div className="stat-value text-2xl text-red-600">{usuarioActual.estadisticas.reservasCanceladas}</div>
                    <div className="stat-desc text-xs">No realizadas</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
