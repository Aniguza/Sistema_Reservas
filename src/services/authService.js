import { buildUrl } from '../config/api.config';

export const authService = {
    login: async (email, password, isAdmin = false) => {
        try {
            const response = await fetch(buildUrl('/auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: email, contraseña: password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en el inicio de sesión');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};
