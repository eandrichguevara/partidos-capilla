# Arquitectura del Proyecto

Este proyecto implementa una **arquitectura feature-driven** con separación clara de responsabilidades.

## Estructura de Carpetas

```
src/
├── domain/              # Lógica de negocio pura (sin dependencias de React/UI)
│   ├── types.ts        # Tipos y interfaces compartidas
│   ├── colors.ts       # Lógica de generación de colores
│   ├── leaderboard.ts  # Cálculo de tabla de posiciones
│   ├── match.ts        # Reglas de partidos y rotación
│   └── queue.ts        # Gestión de cola de equipos
│
├── store/              # Estado global con Zustand + persistencia
│   └── gameStore.ts    # Store principal con middleware persist
│
├── features/           # Módulos por funcionalidad (UI + lógica)
│   ├── match/          # Partido actual
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   ├── queue/          # Cola de espera
│   ├── leaderboard/    # Tabla de posiciones
│   ├── teams/          # Gestión de equipos
│   ├── settings/       # Configuración
│   └── history/        # Historial de partidos
│
├── components/         # Componentes compartidos/reutilizables
│   ├── Timer.tsx
│   └── InfoModal.tsx
│
└── app/               # Pages de Next.js
    └── page.tsx       # Página principal (orquestador ligero)
```

## Principios de Arquitectura

### 1. **Capa de Dominio** (`src/domain/`)

- **Responsabilidad**: Lógica de negocio pura, reglas del juego
- **Características**:
  - Sin dependencias de React, Next.js o UI
  - Funciones puras y testables
  - Exporta helpers y utilidades reutilizables
- **Ejemplos**:
  - `calculateLeaderboard()`: Calcula puntos y ranking
  - `processMatchResult()`: Aplica reglas de victoria/derrota
  - `pickContrastingColor()`: Genera colores únicos

### 2. **Estado Global** (`src/store/`)

- **Responsabilidad**: Gestión centralizada del estado con persistencia
- **Características**:
  - Zustand con middleware `persist`
  - Almacenamiento selectivo en `localStorage`
  - Migraciones y versionado
  - Usa funciones de la capa de dominio
- **Persistencia**:
  ```typescript
  // Solo persiste datos esenciales, no estado transitorio
  partialize: (state) => ({
  	teams,
  	queue,
  	matchHistory,
  	defendingTeam,
  	matchDuration,
  });
  // NO persiste: isTimerRunning, timeLeft, currentMatch
  ```

### 3. **Features** (`src/features/`)

- **Responsabilidad**: Módulos autocontenidos por funcionalidad
- **Estructura típica**:
  ```
  feature/
  ├── components/      # Componentes presentacionales
  ├── hooks/          # Hooks de lógica (contenedores)
  └── index.ts        # Exports públicos
  ```
- **Patrón Contenedor/Presentacional**:
  - **Hooks**: Conectan con el store, manejan lógica
  - **Componentes**: Reciben props, renderizan UI

### 4. **Page como Orquestador** (`src/app/page.tsx`)

- **Responsabilidad**: Composición de features
- **Características**:
  - Mínima lógica de negocio
  - Conecta features entre sí
  - Layout y estructura general

## Flujo de Datos

```
User Interaction
     ↓
Presentational Component (props)
     ↓
Hook (useFeature)
     ↓
Zustand Store (actions)
     ↓
Domain Logic (pure functions)
     ↓
Store Update (state)
     ↓
Component Re-render
```

## Ventajas de esta Arquitectura

1. **Separación de Responsabilidades**

   - Dominio: lógica de negocio
   - Store: gestión de estado
   - Features: UI + interacción
   - Page: orquestación

2. **Testabilidad**

   - Funciones de dominio son puras (fácil de testear)
   - Hooks aislados de UI
   - Componentes presentacionales con props

3. **Escalabilidad**

   - Agregar features nuevos sin tocar otros
   - Reutilizar lógica de dominio
   - Fácil refactorización

4. **Mantenibilidad**
   - Código organizado por funcionalidad
   - Imports explícitos
   - Menos acoplamiento

## Convenciones de Código

### Nombres de Archivos

- **Componentes**: PascalCase (`CurrentMatchCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useCurrentMatch.ts`)
- **Utilidades**: camelCase (`colors.ts`, `match.ts`)
- **Tipos**: PascalCase para interfaces (`Team`, `MatchResult`)

### Estructura de Features

Cada feature debe:

1. Exportar componentes y hooks desde `index.ts`
2. Mantener componentes presentacionales
3. Lógica en hooks personalizados
4. Sin lógica de dominio dentro del feature

### Ejemplo de Feature

```typescript
// features/example/hooks/useExample.ts
export const useExample = () => {
	const data = useGameStore((state) => state.data);
	const action = useGameStore((state) => state.action);

	const handleAction = () => {
		// Llama a lógica de dominio si es necesario
		const result = someDomainLogic(data);
		action(result);
	};

	return { data, handleAction };
};

// features/example/components/ExampleCard.tsx
export const ExampleCard = ({ data, onAction }) => {
	return <div onClick={onAction}>{data}</div>;
};

// features/example/index.ts
export { ExampleCard } from "./components/ExampleCard";
export { useExample } from "./hooks/useExample";
```

## Persistencia de Datos

### Configuración

- **Storage**: `localStorage` (cliente-side)
- **Versión**: 1
- **Hidratación**: Automática al cargar la app

### Datos Persistidos

✅ Persiste:

- Equipos
- Cola de espera
- Historial de partidos
- Equipo defensor
- Duración de partidos

❌ NO persiste:

- Timer corriendo/pausado
- Tiempo restante
- Partido actual (se recalcula)

### Migración de Datos

```typescript
migrate: (persistedState, version) => {
	if (version < 1) {
		// Lógica de migración para versiones antiguas
	}
	return persistedState;
};
```

## Próximos Pasos Sugeridos

### Corto Plazo

1. ✅ Implementar persistencia local
2. ✅ Separar lógica de dominio
3. ✅ Crear features modulares
4. 🔄 Agregar tests unitarios a funciones de dominio

### Mediano Plazo

1. Agregar Storybook para componentes
2. Implementar tests de integración
3. Optimizar performance (React.memo, useMemo)
4. Agregar analytics/tracking

### Largo Plazo

1. Backend opcional (sync entre dispositivos)
2. PWA (app instalable)
3. Modo offline robusto
4. Exportar/importar datos

## Recursos

- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Feature-Driven Architecture](https://khalilstemmler.com/articles/software-design-architecture/organizing-app-logic/)
