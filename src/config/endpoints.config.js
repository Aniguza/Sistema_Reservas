export const API_ENDPOINTS = {
    auth: {
        login: '/auth/login',
    },
    usuarios: {
        list: '/usuarios',
        create: '/usuarios/create',
        perfil: (correo) => `/usuarios/perfil/${encodeURIComponent(correo)}`,
    },
    reservas: {
        base: '/reservas',
        create: '/reservas/create',
        disponibilidad: '/reservas/disponibilidad',
        porUsuario: (correo) => `/reservas/usuario/${encodeURIComponent(correo)}`,
        porId: (id) => `/reservas/${encodeURIComponent(id)}`,
        porEquipo: (id) => `/reservas/equipo/${encodeURIComponent(id)}`,
        porAula: (id) => `/reservas/aula/${encodeURIComponent(id)}`,
        cancelar: (id) => `/reservas/cancelar/${encodeURIComponent(id)}`,
    },
    equipos: {
        list: '/equipos',
        detalle: (id) => `/equipos/${encodeURIComponent(id)}`,
    },
    aulas: {
        list: '/aulas',
    },
    deshabilitacion: {
        status: '/api/deshabilitacion',
    },
};
