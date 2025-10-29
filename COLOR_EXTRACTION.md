# Extracción de Color Dominante de Logos

## Descripción

El sistema ahora extrae automáticamente el color dominante del logo de cada equipo para usarlo como color del equipo. Esto crea una experiencia visual más coherente y profesional.

## Cómo Funciona

### 1. Extracción de Color (`extractDominantColor`)

Ubicación: `/src/domain/colors.ts`

La función `extractDominantColor` utiliza Canvas API para:

1. **Cargar la imagen del logo** en un canvas de 100x100px (optimizado para mejor análisis)
2. **Analizar los píxeles** e ignorar:
   - Píxeles transparentes (alpha < 128)
   - Píxeles muy claros/blancos (RGB > 240) - probablemente fondo
   - Píxeles muy oscuros/negros (RGB < 20) - probablemente contornos
3. **Agrupar colores similares** en bloques de 20 valores RGB
4. **Promediar colores** dentro de cada grupo para mayor precisión
5. **Encontrar el color más frecuente** (color dominante)
6. **Ajustar la saturación y luminosidad** para mejor visualización:
   - Saturación: entre 45% y 75% (colores vibrantes)
   - Luminosidad: entre 35% y 55% (ni muy oscuro ni muy claro)

### 2. Integración en el Store

Ubicación: `/src/store/gameStore.ts`

Cuando se agrega un equipo:

```typescript
addTeam: async (name, logo) => {
	let color = pickContrastingColor(existingColors);

	// Si hay logo, extraer color dominante
	if (logo && typeof window !== "undefined") {
		try {
			color = await extractDominantColor(logo);
		} catch (error) {
			// Fallback al color contrastante
		}
	}

	// Crear equipo con el color extraído
};
```

### 3. Comportamiento

- **Con logo**: El color se extrae automáticamente del logo
- **Sin logo**: Se usa el sistema anterior de colores contrastantes
- **Error al extraer**: Fallback automático a color contrastante
- **Solo en cliente**: La extracción solo ocurre en el navegador (`typeof window !== "undefined"`)
- **Sin píxeles válidos**: Usa un color por defecto (#1f78b4)

## Ventajas

✅ **Coherencia visual**: El color del equipo coincide con su logo  
✅ **Automático**: No requiere configuración manual  
✅ **Robusto**: Fallback a colores contrastantes si falla  
✅ **Optimizado**: Procesa imágenes de 100x100px para balance entre rendimiento y precisión  
✅ **Ajustado**: Los colores se saturan/ajustan para mejor visualización en UI  
✅ **Preciso**: Promedia colores en cada grupo para mayor precisión  
✅ **Filtrado inteligente**: Ignora fondos, contornos y píxeles transparentes

## Algoritmo de Extracción

1. **Carga de imagen** con soporte CORS
2. **Reducción a 100x100px** en canvas
3. **Análisis pixel por pixel**:
   - Filtrar transparentes (alpha < 128)
   - Filtrar blancos (RGB > 240)
   - Filtrar negros (RGB < 20)
4. **Agrupación en bloques de 20 valores RGB**
5. **Acumulación y promedio** de RGB en cada grupo
6. **Selección del grupo más frecuente**
7. **Conversión RGB → HSL**
8. **Ajuste de saturación y luminosidad**
9. **Conversión HSL → HEX**

## Archivos Modificados

- `/src/domain/colors.ts` - Nueva función `extractDominantColor` mejorada
- `/src/store/gameStore.ts` - `addTeam` ahora es async y extrae color
- `/src/features/teams/hooks/useTeamManagement.ts` - Usa `await` con `addTeam`
- `/src/app/page.old.tsx` - `handleAddTeam` ahora es async

## Ejemplo de Uso

```typescript
// Agregar equipo con logo
await addTeam("Barcelona", "/escudos/barcelona.png");
// El color del equipo será extraído del logo de Barcelona
// Por ejemplo, si el logo es azul/rojo, se extraerá el color dominante

// Agregar equipo sin logo
await addTeam("Equipo Local");
// El color será seleccionado de la paleta contrastante

// Con asignación automática de logo (en useTeamManagement)
const response = await fetch("/api/logoAssignment", { ... });
const { path } = await response.json();
await addTeam("Real Madrid", path);
// El logo se asigna automáticamente Y el color se extrae del logo
```

## Casos de Prueba

Los logos en `/public/escudos/` cubren diversos casos:

- **Logos con un color dominante claro**: "leon, amarillo.png", "dragon, rojo, ira.png"
- **Logos multicolor**: "triangulos, blanco negro dorado.png", "mano, indicacion, blaugrana.png"
- **Logos con transparencia**: La mayoría de los escudos
- **Logos con contornos negros**: Se ignoran correctamente
- **Logos con fondos blancos**: Se filtran automáticamente
