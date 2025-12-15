import { buildUrl } from '../config/api.config';
import { API_ENDPOINTS } from '../config/endpoints.config';

export const reservasService = {
    createReserva: async (reservaData) => {
        try {
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.create), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservaData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear la reserva');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};
