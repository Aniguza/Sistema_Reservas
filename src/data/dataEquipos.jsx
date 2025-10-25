import foto from '../assets/Images/equipo.png'

export const dataAulas = [
    {
        id: 1,
        nombre: 'Arquitectura de computadoras',
        descripcion: 'Laboratorio equipado con computadoras de última generación para prácticas de arquitectura de computadoras.',
        ubicacion: 'lab-303',
        tipo: 'Aula',
    },
    {
        id: 2,
        nombre: 'Desarrollo de software',
        descripcion: 'Laboratorio diseñado para el desarrollo de software con estaciones de trabajo colaborativas.',
        ubicacion: 'lab-307',
        tipo: 'Aula',
    },
    {
        id: 3,
        nombre: 'Construcción digital',
        descripcion: 'Laboratorio especializado en construcción digital y fabricación asistida por computadora.',
        ubicacion: 'lab-313-1',
        tipo: 'Aula',
    },
    {
        id: 4,
        nombre: 'Sala BIM',
        descripcion: 'Sala dedicada a la modelación de información de construcción (BIM) con software especializado.',
        ubicacion: 'lab-313-2',
        tipo: 'Aula',
    }

];
export const dataEquipos = [
    {
        id: 1,
        nombre: 'Microscopio Optico',
        descripcion: 'Microscopio óptico de alta resolución para observación de muestras biológicas.',
        imagen: foto,
        categoria: 'Electronico',
        ubicacion: 'lab-303',
        tipo: 'Equipo',
        especificaciones: {
            marca: 'OptiView',
            modelo: 'OV-2000',
            año: 2021,
        },
        disponibilidad: true,
        periodoReserva: {
            minDias: 1,
            maxDias: 7,
            anticipacionMinima: 1 // días
        },
    },
    {
        id: 2,
        nombre: 'Centrífuga de Laboratorio',
        descripcion: 'Centrífuga de alta velocidad para separación de componentes celulares.',
        imagen: foto,
        categoria: 'Electronico',
        ubicacion: 'lab-303',
        tipo: 'Equipo',
        especificaciones: {
            marca: 'CentrifugeX',
            modelo: 'CF-500',
            año: 2020,
        },
        disponibilidad: false,
        periodoReserva: {
            minDias: 1,
            maxDias: 3,
            anticipacionMinima: 2
        },
    },
    {
        id: 3,
        nombre: 'Espectrofotómetro UV-Vis',
        descripcion: 'Espectrofotómetro UV-Vis de alta precisión para análisis de muestras.',
        imagen: foto,
        categoria: 'Tecnologico',
        ubicacion: 'lab-313-1',
        tipo: 'Equipo',
        especificaciones: {
            marca: 'SpectroMax',
            modelo: 'UV-300',
            año: 2022,
        },
        disponibilidad: true,
    },
    {
        id: 4,
        nombre: 'Microscopio Optico',
        descripcion: 'Microscopio óptico de alta resolución para observación de muestras biológicas.',
        imagen: foto,
        categoria: 'Tecnologico',
        ubicacion: 'lab-313-1',
        tipo: 'Equipo',
        especificaciones: {
            marca: 'OptiView',
            modelo: 'OV-2000',
            año: 2021,
        },
        disponibilidad: true,
    },
    {
        id: 5,
        nombre: 'Centrífuga de Laboratorio',
        descripcion: 'Centrífuga de alta velocidad para separación de componentes celulares.',
        imagen: foto,
        categoria: 'Herramienta',
        ubicacion: 'lab-303',
        tipo: 'Equipo',
        especificaciones: {
            marca: 'CentrifugeX',
            modelo: 'CF-500',
            año: 2020,
        },
        disponibilidad: true,
    },
    {
        id: 6,
        nombre: 'Espectrofotómetro UV-Vis',
        descripcion: 'Espectrofotómetro UV-Vis de alta precisión para análisis de muestras.',
        imagen: foto,
        categoria: 'Herramienta',
        ubicacion: 'lab-307',
        tipo: 'Equipo',
        especificaciones: {
            marca: 'SpectroMax',
            modelo: 'UV-300',
            año: 2022,
        },
        disponibilidad: true,
    },
    {
        id: 7,
        nombre: 'Microscopio Optico',
        descripcion: 'Microscopio óptico de alta resolución para observación de muestras biológicas.',
        imagen: foto,
        categoria: 'Herramienta',
        ubicacion: 'lab-307',
        tipo: 'Equipo',
        especificaciones: {
            marca: 'OptiView',
            modelo: 'OV-2000',
            año: 2021,
        },
        disponibilidad: true,
    }
];