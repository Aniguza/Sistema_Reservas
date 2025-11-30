# Guía de Uso de Redux en el Sistema de Reservas

## Estructura Redux Implementada

La aplicación ahora utiliza Redux Toolkit para la gestión centralizada del estado. La estructura incluye:

```
src/
  config/
    api.config.js          # Configuración centralizada de API
  redux/
    store.js               # Store principal de Redux
    slices/
      authSlice.js         # Estado y acciones de autenticación
      equiposSlice.js      # Estado y acciones de equipos
      reservasSlice.js     # Estado y acciones de reservas
```

## Configuración de Variables de Entorno

El archivo `.env` debe usar el prefijo `VITE_` para que Vite pueda acceder a las variables:

```env
VITE_API_BASE="http://localhost:3000"
```

## Uso en Componentes

### 1. Importar hooks de Redux y acciones

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser } from '../redux/slices/authSlice';
import { fetchEquipos, fetchEquipoById } from '../redux/slices/equiposSlice';
import { createReserva, fetchReservas } from '../redux/slices/reservasSlice';
```

### 2. Autenticación (authSlice)

```javascript
function LoginComponent() {
  const dispatch = useDispatch();
  const { user, isLoading, error, isAuthenticated } = useSelector(state => state.auth);

  const handleLogin = async (email, password) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Login exitoso
    } catch (error) {
      // Manejar error
      console.error(error);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    // Tu JSX aquí
  );
}
```

### 3. Equipos (equiposSlice)

```javascript
function EquiposComponent() {
  const dispatch = useDispatch();
  const { items, currentEquipo, isLoading, error } = useSelector(state => state.equipos);

  useEffect(() => {
    // Obtener todos los equipos al montar el componente
    dispatch(fetchEquipos());
  }, [dispatch]);

  const handleSelectEquipo = (id) => {
    dispatch(fetchEquipoById(id));
  };

  return (
    // Tu JSX aquí
  );
}
```

### 4. Reservas (reservasSlice)

```javascript
function ReservasComponent() {
  const dispatch = useDispatch();
  const { items, isLoading, error, success } = useSelector(state => state.reservas);

  const handleCreateReserva = async (reservaData) => {
    try {
      await dispatch(createReserva(reservaData)).unwrap();
      // Reserva creada exitosamente
      dispatch(clearSuccess()); // Limpiar estado de éxito
    } catch (error) {
      // Manejar error
      console.error(error);
    }
  };

  useEffect(() => {
    // Obtener todas las reservas
    dispatch(fetchReservas());
  }, [dispatch]);

  return (
    // Tu JSX aquí
  );
}
```

## Acciones Disponibles

### AuthSlice
- `loginUser({ email, password, isAdmin })` - Iniciar sesión
- `logoutUser()` - Cerrar sesión
- `clearError()` - Limpiar errores
- `setUser(userData)` - Establecer usuario manualmente

### EquiposSlice
- `fetchEquipos()` - Obtener todos los equipos
- `fetchEquipoById(id)` - Obtener un equipo por ID
- `clearError()` - Limpiar errores
- `clearCurrentEquipo()` - Limpiar equipo actual

### ReservasSlice
- `createReserva(reservaData)` - Crear una reserva
- `fetchReservas()` - Obtener todas las reservas
- `fetchReservasByUser(userId)` - Obtener reservas por usuario
- `updateReserva({ id, data })` - Actualizar una reserva
- `deleteReserva(id)` - Eliminar una reserva
- `clearError()` - Limpiar errores
- `clearSuccess()` - Limpiar estado de éxito
- `setCurrentReserva(reserva)` - Establecer reserva actual

## Ventajas de esta Implementación

1. **Gestión Centralizada**: Todo el estado de la aplicación en un solo lugar
2. **Manejo de Loading/Error**: Estados de carga y error incluidos automáticamente
3. **API Centralizada**: Una sola fuente de verdad para la URL base
4. **TypeScript Ready**: Fácil de migrar a TypeScript en el futuro
5. **DevTools**: Integración con Redux DevTools para debugging
6. **Persistencia**: Token guardado en localStorage automáticamente
7. **Escalabilidad**: Fácil agregar nuevos slices según crezca la aplicación

## Servicios Actualizados

Los servicios existentes (`authService`, `equiposService`, `reservasService`) ahora usan la configuración centralizada de API, pero puedes seguir usándolos si no necesitas el estado global de Redux. Sin embargo, se recomienda usar los slices de Redux para mejor gestión del estado.

## Ejemplo Completo de Migración

Antes (sin Redux):
```javascript
import { equiposService } from '../services/equiposService';

function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await equiposService.getAllEquipos();
        setEquipos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ...
}
```

Después (con Redux):
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchEquipos } from '../redux/slices/equiposSlice';

function Equipos() {
  const dispatch = useDispatch();
  const { items: equipos, isLoading: loading, error } = useSelector(state => state.equipos);

  useEffect(() => {
    dispatch(fetchEquipos());
  }, [dispatch]);

  // ...
}
```
