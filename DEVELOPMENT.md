# 🛠️ Guía de Desarrollo

## Comandos Útiles

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint

# Lint y auto-fix
npm run lint -- --fix
```

### Estructura de Archivos

#### Crear un Nuevo Feature

```bash
# Estructura base
mkdir -p src/features/nuevo-feature/{components,hooks}
touch src/features/nuevo-feature/index.ts

# Crear hook
cat > src/features/nuevo-feature/hooks/useNuevoFeature.ts << 'EOF'
import { useGameStore } from "@/store/gameStore";

export const useNuevoFeature = () => {
  // Tu lógica aquí
  return {};
};
EOF

# Crear componente
cat > src/features/nuevo-feature/components/NuevoFeatureCard.tsx << 'EOF'
"use client";

export const NuevoFeatureCard = () => {
  return <div>Nuevo Feature</div>;
};
EOF

# Exportar
cat > src/features/nuevo-feature/index.ts << 'EOF'
export { NuevoFeatureCard } from "./components/NuevoFeatureCard";
export { useNuevoFeature } from "./hooks/useNuevoFeature";
EOF
```

#### Agregar Función de Dominio

```bash
# Crear nuevo archivo en domain/
cat > src/domain/nueva-logica.ts << 'EOF'
/**
 * Descripción de la lógica
 */
export const nuevaFuncion = (params) => {
  // Lógica pura aquí
  return resultado;
};
EOF
```

## Patrones de Código

### 1. Hook Personalizado

```typescript
// features/ejemplo/hooks/useEjemplo.ts
import { useGameStore } from "@/store/gameStore";
import { algunaLogicaDeDominio } from "@/domain/ejemplo";

export const useEjemplo = () => {
	// Seleccionar estado
	const data = useGameStore((state) => state.data);
	const action = useGameStore((state) => state.action);

	// Lógica derivada
	const processedData = useMemo(() => algunaLogicaDeDominio(data), [data]);

	// Handlers
	const handleAction = useCallback(() => {
		action(processedData);
	}, [action, processedData]);

	return {
		data: processedData,
		handleAction,
	};
};
```

### 2. Componente Presentacional

```typescript
// features/ejemplo/components/EjemploCard.tsx
"use client";

interface EjemploCardProps {
	data: string;
	onAction: () => void;
}

export const EjemploCard = ({ data, onAction }: EjemploCardProps) => {
	return (
		<div className="w-full bg-gray-800 rounded-lg p-6 mb-6">
			<h2 className="text-2xl font-semibold mb-4">Título</h2>
			<button onClick={onAction}>{data}</button>
		</div>
	);
};
```

### 3. Función de Dominio

```typescript
// domain/ejemplo.ts
import type { Team } from "./types";

/**
 * Calcula algo basado en equipos
 * @param teams - Lista de equipos
 * @returns Resultado del cálculo
 */
export const calcularAlgo = (teams: Team[]): number => {
	// Lógica pura sin efectos secundarios
	return teams.reduce((acc, team) => acc + team.id, 0);
};
```

### 4. Agregar Acción al Store

```typescript
// store/gameStore.ts
interface GameState {
	// ... estado existente
	nuevaAccion: (param: string) => void;
}

export const useGameStore = create<GameState>()(
	persist(
		(set, get) => ({
			// ... estado inicial

			nuevaAccion: (param) => {
				set((state) => {
					// Usa lógica de dominio si es necesario
					const resultado = algunaFuncionDeDominio(param);

					return {
						// nuevo estado
					};
				});
			},
		})
		// ... configuración persist
	)
);
```

## Testing (Para implementar)

### Test de Función de Dominio

```typescript
// domain/__tests__/leaderboard.test.ts
import { describe, it, expect } from "vitest";
import { calculateLeaderboard } from "../leaderboard";

describe("calculateLeaderboard", () => {
	it("calcula puntos correctamente", () => {
		const teams = [
			/* ... */
		];
		const history = [
			/* ... */
		];

		const result = calculateLeaderboard(teams, history);

		expect(result[0].points).toBe(9);
	});
});
```

### Test de Hook

```typescript
// features/match/__tests__/useCurrentMatch.test.ts
import { renderHook, act } from "@testing-library/react";
import { useCurrentMatch } from "../hooks/useCurrentMatch";

describe("useCurrentMatch", () => {
	it("inicia el timer correctamente", () => {
		const { result } = renderHook(() => useCurrentMatch());

		act(() => {
			result.current.startTimer();
		});

		expect(result.current.isTimerRunning).toBe(true);
	});
});
```

### Test de Componente

```typescript
// features/queue/__tests__/QueueCard.test.tsx
import { render, screen } from "@testing-library/react";
import { QueueCard } from "../components/QueueCard";

describe("QueueCard", () => {
	it("muestra equipos en cola", () => {
		const queue = [{ id: 1, name: "Equipo 1", color: "#ff0000" }];

		render(<QueueCard queue={queue} />);

		expect(screen.getByText("Equipo 1")).toBeInTheDocument();
	});
});
```

## Debugging

### Ver Estado de Zustand

```typescript
// Temporal: agregar en página
useEffect(() => {
	console.log("Estado actual:", useGameStore.getState());
}, []);
```

### Redux DevTools

```bash
npm install -D @redux-devtools/extension

# En gameStore.ts agregar:
import { devtools } from 'zustand/middleware';

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      // ... resto del código
    )
  )
);
```

### React DevTools

1. Instalar extensión de navegador
2. Ver componentes y props
3. Ver hooks y estado

## Performance

### Optimización de Componentes

```typescript
import { memo } from "react";

export const MiComponente = memo(({ data }) => {
	return <div>{data}</div>;
});

MiComponente.displayName = "MiComponente";
```

### Selectores Optimizados

```typescript
// ❌ Malo: causa re-render en cualquier cambio
const state = useGameStore();

// ✅ Bueno: solo re-render cuando cambia 'teams'
const teams = useGameStore((state) => state.teams);

// ✅ Mejor: selector con comparación personalizada
const teams = useGameStore(
	(state) => state.teams,
	(a, b) => a.length === b.length
);
```

## Convenciones

### Nombres

- **Componentes**: `PascalCase` (`CurrentMatchCard`)
- **Hooks**: `camelCase` con prefijo `use` (`useCurrentMatch`)
- **Funciones**: `camelCase` (`calculateLeaderboard`)
- **Archivos**: igual que exports principales
- **Tipos**: `PascalCase` (`Team`, `MatchResult`)

### Imports

```typescript
// Orden recomendado:
// 1. React/Next
import { useState, useEffect } from "react";

// 2. Librerías externas
import { FaIcon } from "react-icons/fa";

// 3. Domain
import type { Team } from "@/domain/types";
import { calculateSomething } from "@/domain/helpers";

// 4. Store
import { useGameStore } from "@/store/gameStore";

// 5. Features
import { useOtherFeature } from "@/features/other";

// 6. Components
import { SharedComponent } from "@/components/Shared";
```

### Estructura de Componentes

```typescript
"use client"; // Si usa hooks

import /* ... */ "react";
import type {} from /* ... */ "@/domain/types";

// 1. Tipos/Interfaces
interface MyComponentProps {
	data: string;
	onAction: () => void;
}

// 2. Helpers/Constantes locales
const LOCAL_CONSTANT = "value";

// 3. Componente
export const MyComponent = ({ data, onAction }: MyComponentProps) => {
	// 3.1 Hooks
	const [state, setState] = useState("");

	// 3.2 Handlers
	const handleClick = () => {
		onAction();
	};

	// 3.3 Render
	return <div onClick={handleClick}>{data}</div>;
};
```

## Recursos Útiles

### Documentación

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

### Tools

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### Inspiración

- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
