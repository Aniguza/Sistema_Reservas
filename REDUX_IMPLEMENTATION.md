# Guía Rápida: Uso de Redux en Componentes

## Ejemplo: Componente que usa equipos

```jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEquipos } from '../redux/slices/equiposSlice';

export const MiComponente = () => {
  const dispatch = useDispatch();
  
  // Obtener estado desde Redux
  const { items: equipos, isLoading, error } = useSelector(state => state.equipos);

  // Cargar datos al montar
  useEffect(() => {
    dispatch(fetchEquipos());
  }, [dispatch]);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {equipos.map(equipo => (
        <div key={equipo._id}>{equipo.name}</div>
      ))}
    </div>
  );
};
```

## Cambios Aplicados en las Páginas

### ✅ Login.jsx
- Usa `loginUser` action de Redux
- El estado de carga viene de Redux
- Token se guarda automáticamente en localStorage

### ✅ Catalogo.jsx  
- Usa `fetchEquipos` para obtener equipos
- Estado de equipos centralizado en Redux
- Aulas todavía se obtienen directamente (pendiente slice)

### ✅ ReservaForm.jsx
- Usa `createReserva` para crear reservas
- Estado de loading/error desde Redux
- Todas las llamadas API usan `buildUrl()`

### ✅ Modales (AgregarEquipos, AgregarCompañeros)
- Usan `buildUrl()` para endpoints
- Ya no tienen URLs hardcodeadas

## Variable de Entorno

Recuerda que Vite requiere el prefijo `VITE_`:

```env
VITE_API_BASE="https://sistemareservasapi-production.up.railway.app"
```

## Próximos Pasos Recomendados

1. **Crear slice para Aulas**: Similar al de equipos
2. **Crear slice para Usuarios**: Para el manejo de perfiles
3. **Agregar Redux Persist**: Para mantener estado entre recargas
4. **Middleware de autenticación**: Interceptor para agregar tokens
5. **Manejo de errores global**: Toast notifications desde Redux

## Estructura Final

```
src/
  config/
    api.config.js          ✅ Configuración centralizada
  redux/
    store.js               ✅ Store principal
    slices/
      authSlice.js         ✅ Autenticación
      equiposSlice.js      ✅ Equipos
      reservasSlice.js     ✅ Reservas
```
