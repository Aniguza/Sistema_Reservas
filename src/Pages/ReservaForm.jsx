import React, { useRef } from 'react'
import { Link } from 'react-router'
import { CgDanger } from "react-icons/cg";
import { FaPlus } from "react-icons/fa";

import { AgregarCompañeros } from '../Components/modals/AgregarCompañeros.jsx';
import { AgregarEquipos } from '../Components/modals/AgregarEquipos.jsx';
import { AceptarReserva } from '../Components/modals/AceptarReserva.jsx';

export const ReservaForm = () => {
  const AgregarCompañerosRef = useRef(null);
  const AgregarEquiposRef = useRef(null);
  const AceptarReservaRef = useRef(null);

  const abrirModalCompañeros = () => {
    AgregarCompañerosRef.current?.showModal();
  };
  const abrirModalEquipos = () => {
    AgregarEquiposRef.current?.showModal();
  };
  const abrirModalAceptarReserva = () => {
    AceptarReservaRef.current?.showModal();
  };
  //Ver el contenido si es que el usuario está logueado

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return (
    isLoggedIn ? (
      <section className='max-w-[1000px] w-full lg:px-5 font-lato'>
        <h1 className='titulos !text-3xl'>Reservar equipo</h1>
        <div className="">
          <form action="" className="flex flex-col items-center">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-15 lg:gap-25 justify-items-center'>
              <div className=' '>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Códigos universitarios y/o docente*</legend>
                  <div className="relative">
                    <input type="text" className="input campos pr-12 z-1" placeholder="U20205313" />
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
                  <legend className="fieldset-legend text-negro text-sm">Nombres completos*</legend>
                  <input type="text" className="input campos" placeholder="Juan Javier Pérez Juarez" />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Carrera universitaria*</legend>
                  <input type="text" className="input campos" placeholder="Ingeniería de Sistemas" />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Docente del curso*</legend>
                  <input type="text" className="input campos" placeholder="Nombre del docente" />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Correo académico del responsable*</legend>
                  <input type="email" className="input campos" placeholder="correo@utp.edu.pe" />
                </fieldset>
              </div>
              <div className=''>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Curso - Laboratorio*</legend>
                  <input type="text" className="input campos" placeholder="Nombre del curso o laboratorio" />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Equipo o aula a solicitar*</legend>
                  <div className="relative">
                    <input type="text" className="input campos pr-12 z-1" placeholder="U20205313" />
                    <button
                      type="button"
                      className="absolute right-10 top-5 z-2 transform -translate-y-1/2 btn btn-sm btn-circle text-primario bg-white hover:bg-red-700 hover:text-white border-none"
                      onClick={abrirModalEquipos}
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-negro text-sm">Propósito*</legend>
                  <input type="text" className="input campos" placeholder='' />
                </fieldset>
                <div className='flex gap-6'>
                  <fieldset className="fieldset ">
                    <legend className="fieldset-legend text-negro text-sm">Hora*</legend>
                    <input type="time" className="input  bg-blanco border-negro w-100 lg:w-45" />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend text-negro text-sm">Fecha*</legend>
                    <input type="date" className="input  bg-blanco border-negro w-100 lg:w-45" />
                  </fieldset>
                </div>
                <p className='mt-5 text-sm  text-primario'>
                  <CgDanger className='inline-block' /> La reserva se realiza con 2 días de atincipación. Una vez confirmada, se enviará un correo con las indicaciones necesarias.</p>
              </div>
            </div>
            <button type="button" className="btn bg-primario text-blanco shadow-none border-none mt-10 p-6" onClick={abrirModalAceptarReserva}>ENVIAR</button>
          </form>
        </div>

        {/* Modal de códigos */}
        <AgregarCompañeros ref={AgregarCompañerosRef} />
        <AgregarEquipos ref={AgregarEquiposRef} />
        <AceptarReserva ref={AceptarReservaRef} />
      </section>

    ) : (
      <div className="text-center">
        <p className="text-lg text-gray-700">Por favor, inicia sesión para acceder a esta página.</p>
        <p className='mt-10'><Link to="/login" className="text-primario hover:underline bg-baseRojo p-3 mt-10 rounded-lg">Iniciar sesión</Link></p>
      </div>
    )
  );
}
