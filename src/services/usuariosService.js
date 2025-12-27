import { buildUrl, defaultHeaders } from '../config/api.config';
import { API_ENDPOINTS } from '../config/endpoints.config';

export const usuariosService = {
    createUsuario: async (usuarioData) => {
        try {
            const response = await fetch(buildUrl(API_ENDPOINTS.usuarios.create), {
                method: 'POST',
                headers: { ...defaultHeaders },
                body: JSON.stringify(usuarioData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || 'Error al registrar el usuario';
                throw new Error(message);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};
