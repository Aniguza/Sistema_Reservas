import React, { forwardRef, useState } from 'react'
import { FaPlus } from "react-icons/fa";
import { useNavigate } from 'react-router';
import { useToastActions } from '../../Context/ToastContext.jsx';
import { FaExclamationTriangle } from 'react-icons/fa';

export const AceptarReserva = forwardRef((props, ref) => {
    const { showSuccess, showError } = useToastActions();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleReservar = async () => {
        if (isLoading) {
            return;
        }
        // no dejar confirmar si no está el checkbox seleccionado
        const checkbox = document.getElementById("confirm-checkbox");
        if (!checkbox.checked) {
            document.getElementById("confirm").classList.remove("hidden");
            showError("Por favor acepta las condiciones antes de continuar", 4000);
            return;
        } else {
            //si está seleccionado, ocultar el mensaje de confirmación
            document.getElementById("confirm").classList.add("hidden");
        }

        // Registrar tiempo final cuando se hace clic en "Reservar"
        if (props.onTimeRegister) {
            props.onTimeRegister();
        }

        try {
            setIsLoading(true);
            if (props.onConfirm) {
                await props.onConfirm();
            }

            // cerrar el modal
            ref.current.close();

            // La confirmación exitosa será manejada por el padre (ReservaForm)
            // No hacemos nada aquí, el toast ya se muestra en ReservaForm
        } catch (error) {
            // El error ya se maneja en ReservaForm, no necesitamos hacer nada aquí
            console.error('Error en confirmación:', error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <>
            {/* Modal para agregar códigos */}
            <dialog ref={ref} className="modal">
                <div className="modal-box w-11/12 max-w-lg">
                    <h3 className="font-bold text-lg mb-4 text-center">Alerta de responsabilidad del uso de labs y equipos</h3>
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <p className="text-mb text-gray mb-6 text-center">
                        Al reservar un equipo, el usuario asume toda responsabilidad por el uso del laboratorio y los equipos asignados.<br />
                        Se compromete a cuidarlos y devolverlos en el mismo estado en que fueron entregados, y a mantener el orden y limpieza del espacio. <br />
                        Cualquier daño, pérdida o mal uso será reportado y tratado según el reglamento de laboratorios.
                    </p>
                    <div className="modal-action flex flex-col items-center gap-4">
                        <div>
                            <input type="checkbox" id="confirm-checkbox" className="checkbox checkbox-sm " />  <span className='text-gray-700 text-sm'>Acepto las condiciones y me comprometo al uso responsable</span>
                        </div>
                        <div>
                            <FaExclamationTriangle className='text-orange-700 text-2xl' />
                            <p className='text-orange-700 text-sm font-bold text-center hidden' id='confirm'>Por favor confirma que has leído y aceptado las condiciones antes de continuar.</p>
                        </div>
                        <button type='submit' className="btn bg-primario text-white hover:bg-red-700 border-none" onClick={handleReservar} disabled={isLoading}>
                            {isLoading ? <span className="loading loading-spinner loading-sm" aria-label="Creando reserva" /> : 'Reservar'}
                        </button>

                    </div>
                </div>
            </dialog>
        </>
    )
});

AceptarReserva.displayName = 'AceptarReserva';
