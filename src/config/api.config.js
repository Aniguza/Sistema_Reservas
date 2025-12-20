// Configuración de la API base desde variables de entorno
export const API_BASE_URL = import.meta.env.VITE_API_BASE;

// Configuración de headers por defecto
export const defaultHeaders = {
    'Content-Type': 'application/json',
};

// Obtiene headers con token cuando existe una sesión válida
export const withAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token
        ? { ...defaultHeaders, 'Authorization': `Bearer ${token}` }
        : { ...defaultHeaders };
};

// Helper para construir URLs
export const buildUrl = (endpoint) => {
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};
