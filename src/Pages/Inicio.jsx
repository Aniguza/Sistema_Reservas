import React from 'react'
import { Hero } from '../Sections/Inicio/Hero.jsx'
import { Equipos } from '../Sections/Inicio/Equipos.jsx'
import { Mensaje } from '../Sections/Inicio/Mensaje.jsx'
import { CardsProceso } from '../Sections/Inicio/CardsProceso.jsx'

export const Inicio = () => {
  return (
    <div>
      <Hero />
      <Equipos />
      <Mensaje />
      <CardsProceso />
    </div>
  )
}
