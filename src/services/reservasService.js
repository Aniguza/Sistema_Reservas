import { buildUrl, withAuthHeaders } from '../config/api.config';
import { API_ENDPOINTS } from '../config/endpoints.config';

export const reservasService = {
    createReserva: async (reservaData) => {
        try {
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.create), {
                method: 'POST',
                headers: withAuthHeaders(),
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
    },

    getReservasByEquipo: async (equipoId) => {
        try {
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.porEquipo(equipoId)), {
                method: 'GET',
                headers: withAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || 'Error al obtener las reservas del equipo';
                throw new Error(message);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    getReservasByAula: async (aulaId) => {
        try {
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.porAula(aulaId)), {
                method: 'GET',
                headers: withAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || 'Error al obtener las reservas del aula';
                throw new Error(message);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};
