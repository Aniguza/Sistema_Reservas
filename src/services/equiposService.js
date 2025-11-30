import { buildUrl } from '../config/api.config';

export const equiposService = {
    getAllEquipos: async () => {
        try {
            const response = await fetch(buildUrl('/equipos'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener los equipos');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching equipos:', error);
            throw error;
        }
    }
};
