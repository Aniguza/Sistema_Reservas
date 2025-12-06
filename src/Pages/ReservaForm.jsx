import React, { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux';
import { createReserva } from '../redux/slices/reservasSlice';
import { CgDanger } from "react-icons/cg";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useToast } from '../Context/ToastContext';

import { AgregarCompañeros } from '../Components/modals/AgregarCompañeros.jsx';
import { AgregarEquipos } from '../Components/modals/AgregarEquipos.jsx';
import { AceptarReserva } from '../Components/modals/AceptarReserva.jsx';

export const ReservaForm = () => {
  const dispatch = useDispatch();
  const { isLoading: isLoadingReserva, error, success } = useSelector(state => state.reservas);
  const { user: currentUser } = useSelector(state => state.auth);
  const { items: usuarios } = useSelector(state => state.usuarios);
  const { showToast } = useToast();

  const AgregarCompañerosRef = useRef(null);
  const AgregarEquiposRef = useRef(null);
  const AceptarReservaRef = useRef(null);

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
  const [correoInput, setCorreoInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCorreoChange = (e) => {
    setCorreoInput(e.target.value);
    
    // Limpiar los campos si el usuario modifica el correo
    if (formData.nombre) {
      setFormData(prev => ({
        ...prev,
        correo: '',
        nombre: '',
        carrera: ''
      }));
    }
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
      const userEmailLoggedIn = localStorage.getItem('userEmail');

      // Verificar que el correo coincida con el usuario logueado
      if (userEmailLoggedIn && userEmailLoggedIn.toLowerCase() !== correoCompleto.toLowerCase()) {
        showToast(' El correo debe coincidir con tu cuenta de usuario actual.', 'error');
        setIsSearching(false);
        return;
      }

      // Buscar en la lista de usuarios
      const usuarioEncontrado = usuarios.find(
        user => user.correo.toLowerCase() === correoCompleto.toLowerCase()
      );

      if (!usuarioEncontrado) {
        showToast('No se encontró un usuario con ese correo en el sistema.', 'error');
        setIsSearching(false);
        return;
      }

      // Autocompletar los campos
      setFormData(prev => ({
        ...prev,
        correo: correoCompleto,
        nombre: usuarioEncontrado.nombre || '',
        carrera: usuarioEncontrado.carrera || ''
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
    setCompaneros(codes);
  };

  const handleSaveEquipos = (selectedIds) => {
    setEquipos(selectedIds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación simple de campos requeridos antes de abrir el modal
    if (!formData.nombre || !formData.correo || !formData.fecha || !formData.horaInicio || !formData.horaFin || equipos.length === 0) {
      showToast('Por favor, completa todos los campos obligatorios', 'error');
      return;
    }

    // Abrir modal de confirmación - el backend validará todo lo demás
    abrirModalAceptarReserva();
  };

  const handleConfirmReserva = async () => {
    // Crear fecha con hora del mediodía para evitar problemas de zona horaria
    const fechaConHora = new Date(`${formData.fecha}T12:00:00`);
    const fechaISO = fechaConHora.toISOString();
    
    const payload = {
      nombre: formData.nombre,
      correo: formData.correo,
      companeros: companeros,
      equipos: equipos,
      tipo: formData.tipo,
      fecha: fechaISO,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
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
      setCorreoInput('');

      // Mostrar mensaje de éxito con toast
      showToast('¡Reserva confirmada con éxito! 🎉 Se enviará un correo con las indicaciones.', 'success', 5000);

      //regresar a pagina de catalogo después de un pequeño delay para que se vea el toast
      setTimeout(() => {
        window.location.href = '/catalogo';
      }, 1000);

    } catch (error) {
      // Cerrar modal
      AceptarReservaRef.current?.close();

      // Mostrar el mensaje de error del backend con toast
      const mensajeError = error.message || error || 'Error al crear la reserva. Por favor, intenta nuevamente.';
      showToast(mensajeError, 'error', 6000);
      
      // Scroll hacia arriba para que el usuario vea el toast
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    isLoggedIn ? (
      <section className='max-w-[1000px] w-full lg:px-5 font-lato p-4'>
        <h1 className='titulos !text-3xl'>Reservar equipo</h1>

        <div className="">
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-15 lg:gap-25 justify-items-center'>
              <div className='w-full'>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Códigos universitarios y/o docente*</legend>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={companeros.length > 0 ? `${companeros.length} seleccionados` : ''}
                      className="input campos pr-12 z-1 cursor-pointer"
                      placeholder="Agregar códigos"
                      onClick={abrirModalCompañeros}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-5 z-2 transform -translate-y-1/2 btn btn-sm btn-circle text-primario bg-white hover:bg-red-700 hover:text-white border-none"
                      onClick={abrirModalCompañeros}
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Correo académico del responsable*</legend>
                  <div className='flex top-5 gap-2'>
                    <input
                      type="text"
                      value={correoInput}
                      onChange={handleCorreoChange}
                      className="input campos"
                      placeholder="u20201467"
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
                  <legend className="fieldset-legend text-negro text-sm">Docente del curso*</legend>
                  <input
                    type="text"
                    name="docente"
                    value={formData.docente}
                    onChange={handleChange}
                    className="input campos"
                    placeholder="Nombre del docente"
                    required
                  />
                </fieldset>

              </div>
              <div className='w-full'>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Curso - Laboratorio*</legend>
                  <input
                    type="text"
                    name="curso"
                    value={formData.curso}
                    onChange={handleChange}
                    className="input campos"
                    placeholder="Nombre del curso o laboratorio"
                    required
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Equipo o aula a solicitar*</legend>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={equipos.length > 0 ? `${equipos.length} equipos seleccionados` : ''}
                      className="input campos pr-12 z-1 cursor-pointer"
                      placeholder="Seleccionar equipos"
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
                  <input
                    type="text"
                    name="proposito"
                    value={formData.proposito}
                    onChange={handleChange}
                    className="input campos"
                    placeholder=''
                    required
                  />
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
                <p className='mt-5 text-sm text-primario'>
                  <CgDanger className='inline-block' /> La reserva se realiza con 2 días de anticipación. Una vez confirmada, se enviará un correo con las indicaciones necesarias.</p>
              </div>
            </div>
            <button type="submit" className="btn bg-primario text-blanco shadow-none border-none mt-10 p-6">ENVIAR</button>
          </form>
        </div>

        {/* Modal de códigos */}
        <AgregarCompañeros ref={AgregarCompañerosRef} onSave={handleSaveCompaneros} initialCodes={companeros} />
        <AgregarEquipos ref={AgregarEquiposRef} onSave={handleSaveEquipos} initialSelected={equipos} />
        <AceptarReserva ref={AceptarReservaRef} onConfirm={handleConfirmReserva} />
      </section>

    ) : (
      <div className="text-center">
        <p className="text-lg text-gray-700">Por favor, inicia sesión para acceder a esta página.</p>
        <p className='mt-10'><Link to="/login" className="text-primario hover:underline bg-baseRojo p-3 mt-10 rounded-lg">Iniciar sesión</Link></p>
      </div>
    )
  );
}
