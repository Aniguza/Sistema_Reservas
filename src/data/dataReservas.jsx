// Datos de ejemplo para reservas de equipos
export const reservasData = {
    'multimetro-1': {
        '2024-07-05': 'occupied',
        '2024-07-06': 'available',
        '2024-07-07': 'available', 
        '2024-07-08': 'available',
        '2024-07-09': 'available',
        '2024-07-12': 'occupied',
        '2024-07-13': 'occupied',
        '2024-07-14': 'occupied',
        '2024-07-18': 'available',
        '2024-07-19': 'available',
        '2024-07-22': 'occupied',
        '2024-07-23': 'occupied',
        '2024-07-24': 'occupied',
        '2024-08-02': 'available',
        '2024-08-03': 'available',
        '2024-08-04': 'available',
        '2024-08-07': 'available',
        '2024-08-10': 'occupied',
        '2024-08-11': 'occupied',
        '2024-08-12': 'occupied',
        '2024-08-13': 'occupied',
        '2024-08-14': 'occupied',
        '2024-08-15': 'occupied',
        '2024-08-16': 'occupied',
        '2024-08-20': 'available',
        '2024-08-21': 'available',
        '2024-08-22': 'available',
        '2024-08-26': 'occupied',
        '2024-08-27': 'occupied',
        '2024-08-30': 'available',
    },
    'osciloscopio-1': {
        '2024-07-03': 'occupied',
        '2024-07-04': 'occupied',
        '2024-07-08': 'available',
        '2024-07-10': 'occupied',
        '2024-07-11': 'occupied',
        '2024-07-12': 'occupied',
        '2024-07-15': 'available',
        '2024-08-01': 'occupied',
        '2024-08-02': 'occupied',
        '2024-08-03': 'occupied',
        '2024-08-05': 'available',
        '2024-08-12': 'occupied',
        '2024-08-13': 'occupied',
        '2024-08-14': 'occupied',
        '2024-08-18': 'available',
        '2024-08-19': 'available',
        '2024-08-20': 'available',
        '2024-08-25': 'occupied',
        '2024-08-26': 'occupied',
    },
    'generador-1': {
        '2024-07-01': 'available',
        '2024-07-02': 'available',
        '2024-07-09': 'occupied',
        '2024-07-10': 'occupied',
        '2024-07-11': 'occupied',
        '2024-07-16': 'occupied',
        '2024-07-17': 'occupied',
        '2024-07-18': 'occupied',
        '2024-07-23': 'available',
        '2024-07-24': 'available',
        '2024-07-25': 'available',
        '2024-08-06': 'occupied',
        '2024-08-07': 'occupied',
        '2024-08-08': 'occupied',
        '2024-08-13': 'available',
        '2024-08-14': 'available',
        '2024-08-15': 'available',
        '2024-08-20': 'occupied',
        '2024-08-21': 'occupied',
        '2024-08-22': 'occupied',
    }
};

// Función para obtener reservas de un equipo específico
export const getReservasEquipo = (equipoId) => {
    return reservasData[equipoId] || {};
};

// Función para agregar una nueva reserva
export const agregarReserva = (equipoId, fecha, estado) => {
    if (!reservasData[equipoId]) {
        reservasData[equipoId] = {};
    }
    reservasData[equipoId][fecha] = estado;
};

// Función para eliminar una reserva
export const eliminarReserva = (equipoId, fecha) => {
    if (reservasData[equipoId]) {
        delete reservasData[equipoId][fecha];
    }
};

// Función para verificar disponibilidad
export const verificarDisponibilidad = (equipoId, fecha) => {
    const reservas = getReservasEquipo(equipoId);
    return reservas[fecha] !== 'occupied';
};

// Función para obtener fechas disponibles en un rango
export const getFechasDisponibles = (equipoId, fechaInicio, fechaFin) => {
    const reservas = getReservasEquipo(equipoId);
    const fechasDisponibles = [];
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    for (let fecha = new Date(inicio); fecha <= fin; fecha.setDate(fecha.getDate() + 1)) {
        const fechaString = fecha.toISOString().split('T')[0];
        if (reservas[fechaString] === 'available' || !reservas[fechaString]) {
            fechasDisponibles.push(fechaString);
        }
    }
    
    return fechasDisponibles;
};

// Función para obtener estadísticas de reservas
export const getEstadisticasReservas = (equipoId) => {
    const reservas = getReservasEquipo(equipoId);
    const total = Object.keys(reservas).length;
    const ocupadas = Object.values(reservas).filter(estado => estado === 'occupied').length;
    const disponibles = Object.values(reservas).filter(estado => estado === 'available').length;
    
    return {
        total,
        ocupadas,
        disponibles,
        porcentajeOcupacion: total > 0 ? (ocupadas / total * 100).toFixed(1) : 0
    };
};

// Función para obtener información de una reserva específica por fecha
export const getInfoReserva = (equipoId, fecha) => {
    const reservas = getReservasEquipo(equipoId);
    const estado = reservas[fecha];
    
    if (!estado) return null;
    
    return {
        estado: estado,
        fecha: fecha
    };
};