import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux';
import { createReserva } from '../redux/slices/reservasSlice';
import { CgDanger } from "react-icons/cg";
import { FaPlus, FaSearch, FaChevronDown  } from "react-icons/fa";
import { useToast } from '../Context/ToastContext';
import { buildUrl } from '../config/api.config';
import { API_ENDPOINTS } from '../config/endpoints.config';
import { fetchUsuarios } from '../redux/slices/usuariosSlice';
import { useInitialData } from '../hooks/useInitialData';

import { AgregarCompañeros } from '../Components/modals/AgregarCompañeros.jsx';
import { AgregarEquipos } from '../Components/modals/AgregarEquipos.jsx';
import { AceptarReserva } from '../Components/modals/AceptarReserva.jsx';
import { formatTime12 } from '../utils/time';

export const ReservaForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading: isLoadingReserva, error, success } = useSelector(state => state.reservas);
  const { user: currentUser } = useSelector(state => state.auth);
  const { items: usuarios, loaded: usuariosLoaded } = useSelector(state => state.usuarios);
  const { showToast } = useToast();
  const { equipos: equiposData, aulas, isLoading: loadingInitialData } = useInitialData();

  const AgregarCompañerosRef = useRef(null);
  const AgregarEquiposRef = useRef(null);
  const AceptarReservaRef = useRef(null);
  const docenteDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: '',
    carrera: '',
    docente: '',
    correo: '',
    curso: '',
    proposito: '',
    horaInicio: '',
    horaFin: '',
    fecha: '',
    tipo: 'equipo'
  });

  const [companeros, setCompaneros] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [aulaSeleccionada, setAulaSeleccionada] = useState(null);
  const [correoInput, setCorreoInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDocente, setIsDocente] = useState(false);
  const [docenteDropdownOpen, setDocenteDropdownOpen] = useState(false);
  const [propositoDropdownOpen, setPropositoDropdownOpen] = useState(false);
  const propositoDropdownRef = useRef(null);

  // Estados para tracking de tiempo del formulario
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoFin, setTiempoFin] = useState(null);
  const [duracionFormulario, setDuracionFormulario] = useState(null);

  // Estados para validaciones de reglas de negocio
  const [validandoReservaDiaria, setValidandoReservaDiaria] = useState(false);
  const [validandoDisponibilidad, setValidandoDisponibilidad] = useState(false);
  const [validacionTiempoReal, setValidacionTiempoReal] = useState({
    validando: false,
    mensaje: null,
    tipo: null // 'success', 'warning', 'error'
  });

  useEffect(() => {
    if (!usuariosLoaded) {
      dispatch(fetchUsuarios());
    }
  }, [dispatch, usuariosLoaded]);

  const docentesDisponibles = useMemo(() => (
    (usuarios || []).filter((usuario) => {
      const rol = (usuario.rol || usuario.role || '').toLowerCase();
      return rol === 'docente';
    })
  ), [usuarios]);

  const selectedDocente = useMemo(() => (
    docentesDisponibles.find((docente) => {
      const docenteId = docente.correo || docente.id || docente._id || docente.nombre;
      return docenteId && formData.docente && formData.docente === docenteId;
    })
  ), [docentesDisponibles, formData.docente]);

  const propositosDisponibles = useMemo(() => [
    'Desarrollo de proyectos de curso',
    'Elaboración de proyecto final',
    'Prácticas para evaluaciones o exposiciones',
    'Desarrollo de trabajos grupales',
    'Uso de software especializado del laboratorio',
    'Simulación o pruebas técnicas'
  ], []);

  useEffect(() => {
    if (!docenteDropdownOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (docenteDropdownRef.current && !docenteDropdownRef.current.contains(event.target)) {
        setDocenteDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDocenteDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [docenteDropdownOpen]);

  useEffect(() => {
    if (docentesDisponibles.length === 0) {
      setDocenteDropdownOpen(false);
    }
  }, [docentesDisponibles.length]);

  useEffect(() => {
    if (formData.docente && !selectedDocente) {
      setFormData(prev => ({ ...prev, docente: '' }));
    }
  }, [formData.docente, selectedDocente]);

  useEffect(() => {
    if (isDocente) {
      setDocenteDropdownOpen(false);
    }
  }, [isDocente]);

  useEffect(() => {
    if (!propositoDropdownOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (propositoDropdownRef.current && !propositoDropdownRef.current.contains(event.target)) {
        setPropositoDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [propositoDropdownOpen]);

  // Validación en tiempo real cuando cambian fecha, hora o equipos/aula
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validarEnTiempoReal();
    }, 500); // Debounce de 500ms para evitar llamadas excesivas

    return () => clearTimeout(timeoutId);
  }, [formData.fecha, formData.horaInicio, formData.horaFin, equipos, aulaSeleccionada, formData.correo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  

  const handleCorreoChange = (e) => {
    const valor = e.target.value;

    // Registrar tiempo de inicio en la primera interacción
    if (!tiempoInicio && valor.length > 0) {
      setTiempoInicio(performance.now());
      console.log('⏱️ Inicio del formulario registrado');
    }

    setCorreoInput(valor);

    // Limpiar los campos si el usuario modifica el correo
    if (formData.nombre) {
      setFormData(prev => ({
        ...prev,
        correo: '',
        nombre: '',
        carrera: '',
        docente: ''
      }));
    }
    setIsDocente(false);
    setCompaneros([]);
    setDocenteDropdownOpen(false);
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      // Construir el correo completo
      const correoCompleto = correoInput.includes('@') 
        ? correoInput 
        : `${correoInput}@utp.edu.pe`;

      // Obtener el correo del usuario logueado desde localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmailLoggedIn = user.correo;

      // Verificar que el correo coincida con el usuario logueado
      if (userEmailLoggedIn && userEmailLoggedIn.toLowerCase() !== correoCompleto.toLowerCase()) {
        showToast(' El correo debe coincidir con tu cuenta de usuario actual.', 'error');
        setIsSearching(false);
        return;
      }

      // Buscar usuario en el backend
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildUrl(API_ENDPOINTS.usuarios.perfil(correoCompleto)), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        showToast('No se encontró un usuario con ese correo en el sistema.', 'error');
        setIsSearching(false);
        return;
      }

      const usuarioEncontrado = await response.json();

      const rolDetectado = (usuarioEncontrado.rol || usuarioEncontrado.role || '').toLowerCase();
      const esDocente = rolDetectado === 'docente' || /^c\d+/i.test(correoCompleto.split('@')[0] || '');
      setIsDocente(esDocente);
      setDocenteDropdownOpen(false);
      if (esDocente && companeros.length > 0) {
        setCompaneros([]);
      }

      // Autocompletar los campos
      setFormData(prev => ({
        ...prev,
        correo: correoCompleto,
        nombre: usuarioEncontrado.nombre || '',
        carrera: usuarioEncontrado.carrera || '',
        docente: esDocente ? '' : prev.docente
      }));
      setCorreoInput(correoInput);
      showToast('Usuario encontrado correctamente', 'success');

    } catch (error) {
      console.error('Error en búsqueda:', error);
      showToast('Error al buscar el usuario. Por favor, intenta nuevamente.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveCompaneros = (codes) => {
    if (isDocente) {
      return;
    }
    setCompaneros(codes);
  };

  // Función para obtener equipos con información del aula
  const getEquiposConAula = (selectedEquipos) => {
    return selectedEquipos.map(item => {
      const equipoData = equiposData.find(eq => eq._id === item.equipo);
      if (!equipoData) return item;

      // Buscar en qué aula está el equipo
      const aulaDelEquipo = aulas.find(aula =>
        Array.isArray(aula.equipos) && aula.equipos.some(e =>
          (typeof e === 'object' && e._id === equipoData._id) || e === equipoData._id
        )
      );

      return {
        ...item,
        aula: aulaDelEquipo ? aulaDelEquipo._id : null,
        aulaNombre: aulaDelEquipo ? aulaDelEquipo.nombre : null
      };
    });
  };

  const handleSaveEquipos = (selectedEquipos, selectedAula) => {
    // Si hay un aula seleccionada, guardamos el aula y limpiamos equipos
    if (selectedAula) {
      setAulaSeleccionada(selectedAula);
      setEquipos([]);
    } else {
      // Si no hay aula, guardamos los equipos
      setAulaSeleccionada(null);
      const equiposConAula = getEquiposConAula(selectedEquipos);
      setEquipos(equiposConAula);
    }
  };

  // Obtener nombre del aula seleccionada
  const getNombreAulaSeleccionada = () => {
    if (!aulaSeleccionada) return '';
    const aula = aulas.find(a => a._id === aulaSeleccionada);
    return aula ? aula.name : 'Aula seleccionada';
  };

  const toggleDocenteDropdown = () => {
    if (isDocente || docentesDisponibles.length === 0) {
      return;
    }
    setDocenteDropdownOpen(prev => !prev);
  };

  const handleSelectDocente = (docente) => {
    const docenteId = docente.correo || docente.id || docente._id || docente.nombre || '';
    setFormData(prev => ({ ...prev, docente: docenteId }));
    setDocenteDropdownOpen(false);
  };

  const togglePropositoDropdown = () => {
    setPropositoDropdownOpen(prev => !prev);
  };

  const handleSelectProposito = (proposito) => {
    setFormData(prev => ({ ...prev, proposito: proposito }));
    setPropositoDropdownOpen(false);
  };

  // Función para verificar si el usuario ya tiene reserva para el día seleccionado
  const verificarReservaDiaria = async () => {
    try {
      setValidandoReservaDiaria(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildUrl(API_ENDPOINTS.reservas.porUsuario(formData.correo)), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al verificar reservas existentes');
      }

      const reservasUsuario = await response.json();

      // Filtrar reservas confirmadas para la fecha seleccionada
      const fechaSeleccionada = new Date(formData.fecha + 'T00:00:00');
      const reservasDiaSeleccionado = reservasUsuario.filter(reserva => {
        const fechaReserva = new Date(reserva.fecha);
        return reserva.estado === 'confirmada' &&
          fechaReserva.toDateString() === fechaSeleccionada.toDateString();
      });

      return reservasDiaSeleccionado.length > 0;
    } catch (error) {
      console.error('Error verificando reserva diaria:', error);
      throw new Error('No se pudo verificar las reservas existentes. Por favor, intenta nuevamente.');
    } finally {
      setValidandoReservaDiaria(false);
    }
  };

  // Función para validación en tiempo real de fecha/hora/equipos
  const validarEnTiempoReal = async () => {
    // Solo validar si tenemos todos los datos necesarios
    const tieneRecurso = equipos.length > 0 || aulaSeleccionada;
    if (!formData.fecha || !formData.horaInicio || !formData.horaFin || !formData.correo || !tieneRecurso) {
      setValidacionTiempoReal({ validando: false, mensaje: null, tipo: null });
      return;
    }

    try {
      setValidacionTiempoReal({ validando: true, mensaje: null, tipo: null });

      // Verificar reserva diaria primero
      const tieneReservaDia = await verificarReservaDiaria();
      if (tieneReservaDia) {
        setValidacionTiempoReal({
          validando: false,
          mensaje: 'Ya tienes una reserva confirmada para este día',
          tipo: 'error'
        });
        return;
      }

      // Verificar disponibilidad con validaciones del backend
      const fechaConHora = new Date(`${formData.fecha}T12:00:00`);
      const fechaISO = fechaConHora.toISOString();

      const token = localStorage.getItem('access_token');
      
      // Construir las aulas a validar
      const aulasAValidar = aulaSeleccionada 
        ? [aulaSeleccionada] 
        : [...new Set(equipos.map(eq => eq.aula).filter(aula => aula !== null))];
      
      const response = await fetch(buildUrl(API_ENDPOINTS.reservas.disponibilidad), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          equipos: aulaSeleccionada ? [] : equipos,
          aulas: aulasAValidar,
          fecha: fechaISO,
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          correoUsuario: formData.correo
        })
      });

      const data = await response.json();

      if (!response.ok || !data.disponible) {
        setValidacionTiempoReal({
          validando: false,
          mensaje: data.message || data.motivo ,
          tipo: 'warning'
        });
      } else {
        setValidacionTiempoReal({
          validando: false,
          mensaje: 'Horario disponible para reserva',
          tipo: 'success'
        });
      }
    } catch (error) {
      console.error('Error en validación tiempo real:', error);
      setValidacionTiempoReal({
        validando: false,
        mensaje: 'Error al verificar disponibilidad',
        tipo: 'error'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación simple de campos requeridos antes de abrir el modal
    const tieneRecurso = equipos.length > 0 || aulaSeleccionada;
    if (!formData.nombre || !formData.correo || !formData.fecha || !formData.horaInicio || !formData.horaFin || !tieneRecurso || (!isDocente && !selectedDocente)) {
      showToast('Por favor, completa todos los campos obligatorios', 'error');
      return;
    }

    // Abrir modal de confirmación - el backend validará todo lo demás
    abrirModalAceptarReserva();
  };

  // Función para registrar el tiempo final cuando se confirma la reserva
  const registrarTiempoFinal = () => {
    if (tiempoInicio && !tiempoFin) {
      const tiempoActual = performance.now();
      setTiempoFin(tiempoActual);

      // Calcular duración en segundos
      const duracionSegundos = Math.round((tiempoActual - tiempoInicio) / 1000);
      setDuracionFormulario(duracionSegundos);

      console.log(`⏱️ Reserva confirmada en ${duracionSegundos} segundos`);

      // Opcional: enviar al backend para analytics
      enviarMetricasTiempo(duracionSegundos);
    }
  };

  const handleConfirmReserva = async () => {
    // Crear fecha con hora del mediodía para evitar problemas de zona horaria
    const fechaConHora = new Date(`${formData.fecha}T12:00:00`);
    const fechaISO = fechaConHora.toISOString();

    // REGLA 1: Verificar que el usuario no tenga otra reserva para este día
    try {
      const tieneReservaDia = await verificarReservaDiaria();
      if (tieneReservaDia) {
        showToast('Ya tienes una reserva confirmada para este día. Solo puedes hacer una reserva por día.', 'error', 6000);
        return;
      }
    } catch (error) {
      showToast(error.message || 'Error al verificar reservas existentes. Por favor, intenta nuevamente.', 'error');
      return;
    }

    // Verificar disponibilidad antes de crear la reserva
    try {
      setValidandoDisponibilidad(true);
      const token = localStorage.getItem('access_token');
      
      // Construir las aulas a validar
      const aulasAValidar = aulaSeleccionada 
        ? [aulaSeleccionada] 
        : [...new Set(equipos.map(eq => eq.aula).filter(aula => aula !== null))];
      
      const disponibilidadResponse = await fetch(buildUrl(API_ENDPOINTS.reservas.disponibilidad), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          equipos: aulaSeleccionada ? [] : equipos,
          aulas: aulasAValidar,
          fecha: fechaISO,
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          correoUsuario: formData.correo
        })
      });

      const disponibilidadData = await disponibilidadResponse.json();

      if (!disponibilidadResponse.ok || !disponibilidadData.disponible) {
        AceptarReservaRef.current?.close();
        showToast(disponibilidadData.mensaje || 'Los equipos no están disponibles en el horario seleccionado. Puede deberse a conflictos de horario o falta de separación mínima de 1 hora entre usuarios diferentes.', 'error', 6000);
        return;
      }
    } catch (error) {
      AceptarReservaRef.current?.close();
      showToast('Error al verificar disponibilidad. Por favor, intenta nuevamente.', 'error');
      return;
    } finally {
      setValidandoDisponibilidad(false);
    }
    
    const payload = {
      nombre: formData.nombre,
      correo: formData.correo,
      companeros: companeros,
      equipos: aulaSeleccionada ? [] : equipos, // Si hay aula, no enviamos equipos
      aula: aulaSeleccionada || null, // Enviamos el aula si está seleccionada
      tipo: aulaSeleccionada ? 'aula' : formData.tipo,
      fecha: fechaISO,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      docente: selectedDocente ? (selectedDocente.correo || selectedDocente.nombre || '') : '',
      motivo: `${formData.curso} - ${formData.proposito}`,
      estado: 'confirmada'
    };

    try {
      const result = await dispatch(createReserva(payload)).unwrap();

      // Cerrar modal y resetear formulario al tener éxito
      AceptarReservaRef.current?.close();
      setFormData({
        nombre: '',
        carrera: '',
        docente: '',
        correo: '',
        curso: '',
        proposito: '',
        horaInicio: '',
        horaFin: '',
        fecha: '',
        tipo: 'equipo'
      });
      setCompaneros([]);
      setEquipos([]);
      setAulaSeleccionada(null);
      setCorreoInput('');
      setIsDocente(false);
      resetTiempos();

      // Mostrar mensaje de éxito con toast
      showToast('¡Reserva confirmada con éxito! 🎉 Se enviará un correo con las indicaciones.', 'success', 5000);

      //regresar a pagina de catalogo después de un pequeño delay para que se vea el toast
      setTimeout(() => {
        navigate('/catalogo');
      }, 1000);

    } catch (error) {
      // Cerrar modal
      AceptarReservaRef.current?.close();

      // Manejo específico de errores de validación de reglas de negocio
      let mensajeError = error.message || error || 'Error al crear la reserva. Por favor, intenta nuevamente.';

      

      showToast(mensajeError, 'error', 6000);

      // Scroll hacia arriba para que el usuario vea el toast
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Función opcional para enviar métricas de tiempo al backend
  const enviarMetricasTiempo = async (duracion) => {
    // Solo enviar si existe el endpoint configurado
    if (!API_ENDPOINTS.analytics?.tiempoFormulario) {
      console.log(`📊 Métrica registrada: ${duracion} segundos (sin envío al backend)`);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildUrl(API_ENDPOINTS.analytics.tiempoFormulario), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tipo: 'tiempo_completar_reserva',
          duracion_segundos: duracion,
          fecha_registro: new Date().toISOString(),
          usuario: formData.correo || 'anonimo'
        })
      });

      if (response.ok) {
        console.log(`📊 Métrica enviada al backend: ${duracion} segundos`);
      } else {
        console.warn(`⚠️ Error enviando métrica al backend: ${response.status}`);
      }
    } catch (error) {
      console.error('Error enviando métricas de tiempo:', error);
    }
  };

  // Función para obtener estadísticas de tiempo (opcional)
  const obtenerEstadisticasTiempo = async () => {
    if (!API_ENDPOINTS.analytics?.estadisticasTiempoFormulario) {
      console.log('📊 Endpoint de estadísticas no configurado');
      return null;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildUrl(API_ENDPOINTS.analytics.estadisticasTiempoFormulario), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const stats = await response.json();
        console.log('📊 Estadísticas obtenidas:', stats);
        return stats;
      } else {
        console.warn(`⚠️ Error obteniendo estadísticas: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  };

  // Función para resetear los tiempos del formulario
  const resetTiempos = () => {
    setTiempoInicio(null);
    setTiempoFin(null);
    setDuracionFormulario(null);
  };

  const abrirModalCompañeros = () => {
    AgregarCompañerosRef.current?.showModal();
  };
  const abrirModalEquipos = () => {
    AgregarEquiposRef.current?.showModal();
  };
  const abrirModalAceptarReserva = () => {
    AceptarReservaRef.current?.showModal();
  };

  const isLoggedIn = !!localStorage.getItem('access_token');

  return (
    isLoggedIn ? (
      <section className='max-w-[1000px] w-full lg:px-5 font-lato p-4'>
        <h1 className='titulos !text-3xl'>Reservar</h1>

        <div className="">
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-15 lg:gap-25 justify-items-center'>
              <div className='w-full'>
                
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Correo académico del responsable*</legend>
                  <div className='flex top-5 gap-2'>
                    <input
                      type="text"
                      value={correoInput}
                      onChange={handleCorreoChange}
                      className="input campos"
                      placeholder="u20201467 o c36528"
                      required
                    />
                    <button 
                      className='btn bg-primario hover:bg-red-800' 
                      type="button"
                      onClick={handleSearchUser}
                      disabled={!correoInput || isSearching}
                    >
                      {isSearching ? (
                        <span className="loading loading-spinner loading-sm text-white"></span>
                      ) : (
                        <FaSearch className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ingresa solo tu código (ej: u20201467) sin @utp.edu.pe</p>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Nombres completos*</legend>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="input campos text-negro"
                    placeholder="Juan Javier Pérez Juarez"
                    required
                    disabled
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Carrera universitaria*</legend>
                  <input
                    type="text"
                    name="carrera"
                    value={formData.carrera}
                    onChange={handleChange}
                    className="input campos text-negro"
                    placeholder="Ingeniería de Sistemas"
                    required
                    disabled
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Compañeros:</legend>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={companeros.length > 0 ? `${companeros.length} seleccionados` : ''}
                      className={`input campos pr-12 z-1 ${isDocente || docentesDisponibles.length === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      placeholder="Agregar códigos"
                      onClick={!isDocente ? abrirModalCompañeros : undefined}
                      disabled={isDocente}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-5 z-2 transform -translate-y-1/2 btn btn-sm btn-circle text-primario bg-white hover:bg-red-700 hover:text-white border-none"
                      onClick={!isDocente ? abrirModalCompañeros : undefined}
                      disabled={isDocente}
                    >
                      <FaPlus className={`w-3 h-3 ${isDocente ? 'opacity-60' : ''}`} />
                    </button>
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Docente del curso*</legend>
                  <div className="relative" ref={docenteDropdownRef}>
                    <button
                      type="button"
                      onClick={toggleDocenteDropdown}
                      className={`input campos pr-5 flex items-center justify-between ${isDocente || docentesDisponibles.length === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      disabled={isDocente || docentesDisponibles.length === 0}
                      aria-haspopup="listbox"
                      aria-expanded={docenteDropdownOpen}
                    >
                      <span className={`truncate ${formData.docente ? 'text-negro' : 'text-gray-500'}`}>
                        {selectedDocente ? `${selectedDocente.nombre || 'Docente'} - ${selectedDocente.correo || 'Sin correo'}` : 'Selecciona un docente'}
                      </span>
                      <FaChevronDown className={`text-primario transition-transform duration-200 ${docenteDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {docenteDropdownOpen && (
                      <ul className="absolute z-20  w-full bg-white border border-negro rounded-md shadow-lg max-h-48 overflow-auto" role="listbox">
                        {docentesDisponibles.map((docente, index) => {
                          const docenteId = docente.correo || docente.id || docente._id || docente.nombre;
                          const isSelected = formData.docente && docenteId && formData.docente === docenteId;
                          return (
                            <li key={docenteId || docente.nombre || `docente-${index}`} className="border-b last:border-b-0 border-gray-200">
                              <button
                                type="button"
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${isSelected ? 'bg-baseRojo font-semibold text-negro' : 'hover:bg-baseRojo'}`}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => handleSelectDocente(docente)}
                              >
                                {`${docente.nombre || 'Docente'}`}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  {!isDocente && docentesDisponibles.length === 0 && (
                    <p className="text-xs text-gray-500">No hay docentes disponibles para seleccionar.</p>
                  )}
                </fieldset>

              </div>
              <div className='w-full'>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Curso*</legend>
                  <input
                    type="text"
                    name="curso"
                    value={formData.curso}
                    onChange={handleChange}
                    className="input campos"
                    placeholder="Ingresa el curso"
                    required
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Equipo o aula a solicitar*</legend>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={
                        aulaSeleccionada 
                          ? `Aula: ${getNombreAulaSeleccionada()}` 
                          : equipos.length > 0 
                            ? `${equipos.length} equipos (${equipos.reduce((total, eq) => total + eq.cantidad, 0)} unidades)` 
                            : ''
                      }
                      className="input campos pr-12 z-1 cursor-pointer"
                      placeholder="Seleccionar equipos o aula"
                      onClick={abrirModalEquipos}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-5 z-2 transform -translate-y-1/2 btn btn-sm btn-circle text-primario bg-white hover:bg-red-700 hover:text-white border-none"
                      onClick={abrirModalEquipos}
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Propósito*</legend>
                  <div className="relative" ref={propositoDropdownRef}>
                    <button
                      type="button"
                      onClick={togglePropositoDropdown}
                      className="input campos pr-5 flex items-center justify-between cursor-pointer"
                      aria-haspopup="listbox"
                      aria-expanded={propositoDropdownOpen}
                    >
                      <span className={`truncate ${formData.proposito ? 'text-negro' : 'text-gray-500'}`}>
                        {formData.proposito || 'Seleccionar propósito'}
                      </span>
                      <FaChevronDown className={`text-primario transition-transform duration-200 ${propositoDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {propositoDropdownOpen && (
                      <ul className="absolute z-20 w-full bg-white border border-negro rounded-md shadow-lg max-h-48 overflow-auto" role="listbox">
                        {propositosDisponibles.map((proposito, index) => {
                          const isSelected = formData.proposito === proposito;
                          return (
                            <li key={`proposito-${index}`} className="border-b last:border-b-0 border-gray-200">
                              <button
                                type="button"
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${isSelected ? 'bg-baseRojo font-semibold text-negro' : 'hover:bg-baseRojo'}`}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => handleSelectProposito(proposito)}
                              >
                                {proposito}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </fieldset>
                <div className='flex gap-6'>
                  <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend text-negro text-sm">Hora Inicio*</legend>
                    <input
                      type="time"
                      name="horaInicio"
                      value={formData.horaInicio}
                      onChange={handleChange}
                      className="input bg-blanco border-negro w-full"
                      required
                    />
                    {formData.horaInicio && (
                      <div className="text-sm text-gray-600">{formatTime12(formData.horaInicio)}</div>
                    )}
                  </fieldset>
                  <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend text-negro text-sm">Hora Fin*</legend>
                    <input
                      type="time"
                      name="horaFin"
                      value={formData.horaFin}
                      onChange={handleChange}
                      className="input bg-blanco border-negro w-full"
                      required
                    />
                    {formData.horaFin && (
                      <div className="text-sm text-gray-600">{formatTime12(formData.horaFin)}</div>
                    )}
                  </fieldset>
                </div>
                <fieldset className="fieldset w-full">
                  <legend className="fieldset-legend text-negro text-sm">Fecha*</legend>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className="input bg-blanco border-negro w-full"
                    required
                  />
                </fieldset>

                {/* Feedback de validación en tiempo real */}
                {validacionTiempoReal.mensaje && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${
                    validacionTiempoReal.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                    validacionTiempoReal.tipo === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {validacionTiempoReal.validando ? (
                      <div className="flex items-center gap-2">
                        <span className="loading loading-spinner loading-sm"></span>
                        Verificando disponibilidad...
                      </div>
                    ) : (
                      validacionTiempoReal.mensaje
                    )}
                  </div>
                )}

                <p className='mt-5 text-sm text-primario'>
                  <CgDanger className='inline-block' /> La reserva se realiza con 2 días de anticipación. Una vez confirmada, se enviará un correo con las indicaciones necesarias.</p>
              </div>
            </div>
            <button
              type="submit"
              className="btn bg-primario text-blanco shadow-none border-none mt-10 p-6"
              disabled={validandoReservaDiaria || validandoDisponibilidad}
            >
              {(validandoReservaDiaria || validandoDisponibilidad) ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Validando...
                </div>
              ) : (
                'ENVIAR'
              )}
            </button>
          </form>
        </div>

        {/* Modal de códigos */}
        <AgregarCompañeros ref={AgregarCompañerosRef} onSave={handleSaveCompaneros} initialCodes={companeros} />
        <AgregarEquipos ref={AgregarEquiposRef} onSave={handleSaveEquipos} initialSelected={equipos} initialSelectedAula={aulaSeleccionada} />
        <AceptarReserva ref={AceptarReservaRef} onConfirm={handleConfirmReserva} onTimeRegister={registrarTiempoFinal} />
      </section>

    ) : (
      <div className="text-center">
        <p className="text-lg text-gray-700">Por favor, inicia sesión para acceder a esta página.</p>
        <p className='mt-10'><Link to="/login" className="text-primario hover:underline bg-baseRojo p-3 mt-10 rounded-lg">Iniciar sesión</Link></p>
      </div>
    )
  );
}
