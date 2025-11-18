import React, { forwardRef } from 'react'
import { FaPlus } from "react-icons/fa";

export const AgregarEquipos = forwardRef((props, ref) => {
    return (
        <>
            {/* Modal para agregar códigos */}
            <dialog ref={ref} className="modal">
                <div className="modal-box w-11/12 max-w-2xl">
                    <h3 className="font-bold text-lg mb-4">Agregar Códigos de Equiposs</h3>
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <p className="text-sm text-gray-600 mb-6">
                        Agrega los códigos universitarios de los estudiantes que participarán en la reserva.
                    </p>

                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Código Universitario</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ej: U20205313"
                                    className="input input-bordered flex-1"
                                />
                                <button className="btn btn-primary">
                                    <FaPlus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Lista de códigos agregados */}
                        <div className="mt-6">
                            <h4 className="font-semibold mb-3">Códigos Agregados:</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {/* Ejemplo de códigos - aquí irían los códigos dinámicos */}
                                <div className="flex items-center justify-between bg-base-200 p-3 rounded-lg">
                                    <span className="font-mono">U20205313</span>
                                    <button className="btn btn-sm btn-error">
                                        Eliminar
                                    </button>
                                </div>
                                <div className="flex items-center justify-between bg-base-200 p-3 rounded-lg">
                                    <span className="font-mono">U20206789</span>
                                    <button className="btn btn-sm btn-error">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-action">
                        <form method="dialog" className="flex gap-2">
                            <button className="btn btn-outline">Cancelar</button>
                            <button className="btn bg-primario text-white hover:bg-red-700 border-none">
                                Guardar Códigos
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    )
});
