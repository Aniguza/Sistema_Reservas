# Optimización de Llamadas a Endpoints - Redux

## 🎯 Problema Identificado

Los endpoints se estaban llamando **múltiples veces** porque:

1. **Catalogo.jsx** llamaba a `/equipos` y `/aulas`
2. **ReservaForm.jsx** llamaba a `/equipos`, `/aulas` y `/usuarios`
3. **AgregarEquipos.jsx** (modal) llamaba a `/equipos`
4. **AgregarCompañeros.jsx** (modal) llamaba a `/usuarios`

Resultado: Cada componente hacía su propia llamada independiente, causando **duplicación de peticiones**.

## ✅ Solución Implementada

### 1. Nuevos Slices de Redux

#### **aulasSlice.js**
```javascript
export const fetchAulas = createAsyncThunk('aulas/fetchAll', ...)
```

#### **usuariosSlice.js**
```javascript
export const fetchUsuarios = createAsyncThunk('usuarios/fetchAll', ...)
```

### 2. Store Actualizado

```javascript
// src/redux/store.js
reducer: {
  auth: authReducer,
  equipos: equiposReducer,
  reservas: reservasReducer,
  aulas: aulasReducer,        // ✅ Nuevo
  usuarios: usuariosReducer,   // ✅ Nuevo
}
```

### 3. Hook Personalizado: `useInitialData`

Creado un hook que:
- ✅ **Carga datos solo si NO existen** en Redux
- ✅ **Evita llamadas duplicadas** verificando `isLoading`
- ✅ **Centraliza la lógica** de carga inicial
- ✅ **Es reutilizable** en cualquier componente

```javascript
// Uso simple
const { equipos, aulas, usuarios } = useInitialData({
  loadEquipos: true,
  loadAulas: true,
  loadUsuarios: true,
});
```

### 4. Componentes Optimizados

#### ✅ **Catalogo.jsx**
**Antes:**
```javascript
useEffect(() => {
  dispatch(fetchEquipos());
  fetch('/aulas').then(...)  // Llamada duplicada
}, [dispatch]);
```

**Después:**
```javascript
const { equipos, aulas } = useInitialData({ 
  loadEquipos: true, 
  loadAulas: true 
});
// ¡Una sola línea! No más useEffect
```

#### ✅ **ReservaForm.jsx**
**Antes:**
```javascript
useEffect(() => {
  fetch('/equipos').then(...)
  fetch('/aulas').then(...)
  fetch('/usuarios').then(...)
}, []);
```

**Después:**
```javascript
const { equipos, aulas, usuarios } = useInitialData({
  loadEquipos: true,
  loadAulas: true,
  loadUsuarios: true,
});
```

#### ✅ **AgregarEquipos.jsx**
**Antes:**
```javascript
useEffect(() => {
  fetch('/equipos').then(...)  // Llamada duplicada
}, []);
```

**Después:**
```javascript
const { equipos } = useInitialData({ loadEquipos: true });
// Usa los datos de Redux, no hace nueva llamada
```

#### ✅ **AgregarCompañeros.jsx**
**Antes:**
```javascript
useEffect(() => {
  fetch('/usuarios').then(...)  // Llamada duplicada
}, []);
```

**Después:**
```javascript
const { usuarios } = useInitialData({ loadUsuarios: true });
// Usa los datos de Redux, no hace nueva llamada
```

## 📊 Resultados

### Antes de la Optimización
```
Catalogo.jsx        → GET /equipos
Catalogo.jsx        → GET /aulas
ReservaForm.jsx     → GET /equipos    (DUPLICADO)
ReservaForm.jsx     → GET /aulas      (DUPLICADO)
ReservaForm.jsx     → GET /usuarios
AgregarEquipos      → GET /equipos    (DUPLICADO)
AgregarCompañeros   → GET /usuarios   (DUPLICADO)
────────────────────────────────────────
TOTAL: 7 llamadas (4 duplicadas)
```

### Después de la Optimización
```
Primera carga       → GET /equipos    (Redux)
Primera carga       → GET /aulas      (Redux)
Primera carga       → GET /usuarios   (Redux)
Componentes         → Usan Redux store
────────────────────────────────────────
TOTAL: 3 llamadas (0 duplicadas) ✅
```

## 🚀 Ventajas

1. **Reducción de llamadas**: De 7 a 3 llamadas HTTP
2. **Menor carga del servidor**: -57% de peticiones
3. **Carga más rápida**: Datos compartidos entre componentes
4. **Código más limpio**: Hook reutilizable
5. **Single Source of Truth**: Redux como única fuente
6. **Mejor UX**: Sin múltiples spinners de carga

## 🔧 Cómo Usar

### En cualquier componente:

```javascript
import { useInitialData } from '../hooks/useInitialData';

function MiComponente() {
  // Solo pide lo que necesitas
  const { equipos, isLoading } = useInitialData({ 
    loadEquipos: true 
  });

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      {equipos.map(equipo => (
        <div key={equipo._id}>{equipo.name}</div>
      ))}
    </div>
  );
}
```

### Múltiples recursos:

```javascript
const { equipos, aulas, usuarios, isLoading } = useInitialData({
  loadEquipos: true,
  loadAulas: true,
  loadUsuarios: true,
});
```

## 📁 Archivos Modificados

- ✅ `src/redux/slices/aulasSlice.js` (nuevo)
- ✅ `src/redux/slices/usuariosSlice.js` (nuevo)
- ✅ `src/redux/store.js` (actualizado)
- ✅ `src/hooks/useInitialData.js` (nuevo)
- ✅ `src/Pages/Catalogo.jsx` (optimizado)
- ✅ `src/Pages/ReservaForm.jsx` (optimizado)
- ✅ `src/Components/modals/AgregarEquipos.jsx` (optimizado)
- ✅ `src/Components/modals/AgregarCompañeros.jsx` (optimizado)

## 🎓 Lecciones Aprendidas

1. **Redux no es solo para estado**: También previene peticiones duplicadas
2. **Hooks personalizados**: Excelentes para lógica reutilizable
3. **Verificar antes de cargar**: Siempre chequear si los datos ya existen
4. **Centralizar es mejor**: Una sola fuente de datos = menos errores

---

**Resultado final**: Sistema más eficiente, rápido y fácil de mantener 🎉
