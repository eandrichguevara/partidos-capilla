# Guía de Keywords Negativas y Exclusiones para Logos

## ✅ Implementación Completada

El sistema de asignación de logos ahora soporta **keywords negativas** y **exclusiones** para mejorar la precisión del matching semántico.

## 📋 Cómo Funciona

### 1. **Keywords Normales** (campo `keywords`)

Palabras que aumentan la probabilidad de que el logo sea seleccionado.

```typescript
keywords: "león, amarillo, rey, felino, salvaje, melena, valentía, fuerza";
```

### 2. **Keywords Negativas** (campo `negativeKeywords`) - OPCIONAL

Palabras que **reducen el score** si aparecen en el nombre del equipo.

- Penalización: **-0.3 por cada palabra coincidente**
- Útil para evitar coincidencias parciales no deseadas

```typescript
negativeKeywords: "universidad, católica, cruzados";
```

### 3. **Exclusiones** (campo `exclusions`) - OPCIONAL

Palabras que **descartan completamente** el logo si aparecen en el nombre del equipo.

- El logo NO será considerado en absoluto
- Útil para prevenir matches totalmente incorrectos

```typescript
exclusions: "chile, chileno, selección";
```

## 🎯 Ejemplos de Uso

### Ejemplo 1: Evitar que "la roja" matchee con logos rojiblancos

**Problema**: "La Roja" (selección chilena) estaba matcheando con "x_cruzadas" por la palabra "rojo"

**Solución**:

```typescript
{
  id: "x_cruzadas",
  path: "/escudos/x, cruzadas, rojiblanco.png",
  keywords: "X, cruzadas, rojo, blanco, rojiblanco, cruz, marca, símbolo",
  negativeKeywords: "chile, chileno, selección, la roja", // Reduce score si aparecen
  exclusions: "" // O usar "chile, selección" para descartarlo completamente
}
```

### Ejemplo 2: Logos de universidades chilenas que no deben confundirse

**UC (Universidad Católica)** no debe matchear con equipos que mencionen "universidad de chile":

```typescript
{
  id: "u_catolica",
  keywords: "universidad católica, UC, cruzados...",
  negativeKeywords: "U de chile, chuncho, azul",
  exclusions: "u de chile" // Excluye totalmente si menciona "u de chile"
}
```

**U de Chile** no debe matchear con equipos que mencionen "católica":

```typescript
{
  id: "universidad_u",
  keywords: "universidad de chile, U, la U, azul...",
  negativeKeywords: "católica, cruzados, UC",
  exclusions: "católica, UC" // Excluye totalmente si menciona estas
}
```

### Ejemplo 3: Equipos chilenos vs no chilenos

**Cóndor de Chile** debe matchear solo con "la roja":

```typescript
{
  id: "condor_chile",
  keywords: "la roja, chile, cóndor, selección chilena...",
  // Ya tiene keywords fuertes, no necesita exclusiones
}
```

**Colo-Colo** no debe confundirse con otros equipos:

```typescript
{
  id: "colo_colo",
  keywords: "colo colo, colo-colo, cacique, lautaro...",
  exclusions: "católica, U de chile, universidad" // No es un equipo universitario
}
```

## 🔧 Cómo Agregar Keywords Negativas a un Logo

1. Abre `/src/app/api/logoAssignment/route.ts`
2. Busca el logo que quieres modificar
3. Agrega los campos opcionales:

```typescript
{
  id: "tu_logo_id",
  path: "/escudos/tu_logo.png",
  keywords: "keywords normales aquí",
  negativeKeywords: "palabra1, palabra2, palabra3", // NUEVO - opcional
  exclusions: "palabra_excluir1, palabra_excluir2"  // NUEVO - opcional
}
```

## ⚙️ Ajustes de Penalización

La penalización actual es **-0.3 por keyword negativa**. Si necesitas ajustarla:

Busca en `route.ts` la línea:

```typescript
score = score - matchedNegatives.length * 0.3;
```

Puedes cambiar `0.3` a:

- `0.5` → Penalización más fuerte
- `0.2` → Penalización más suave
- `0.8` → Penalización muy fuerte (casi excluye el logo)

## 📊 Testing

Para probar que funcione:

1. Crea un equipo llamado "La Roja"

   - **Debe** asignar el logo `condor_chile`
   - **No debe** asignar `x_cruzadas` u otros logos con "rojo"

2. Crea un equipo llamado "U de Chile"

   - **Debe** asignar `universidad_u`
   - **No debe** asignar `u_catolica`

3. Crea un equipo llamado "Cruzados"
   - **Debe** asignar `u_catolica`
   - **No debe** asignar `universidad_u`

## 🚀 Estado Actual

- ✅ Sistema implementado y funcional
- ✅ Tipos TypeScript agregados
- ✅ Lógica de exclusión implementada
- ✅ Lógica de penalización implementada
- ⏳ Pendiente: Agregar keywords negativas/exclusiones a logos específicos según necesidad

## 💡 Recomendaciones

1. **Usa `negativeKeywords`** cuando quieras reducir probabilidad, no eliminarla
2. **Usa `exclusions`** cuando quieras garantizar que NO se use el logo
3. **Separa palabras con comas**: `"palabra1, palabra2, palabra3"`
4. **Usa lowercase**: el sistema compara en minúsculas automáticamente
5. **Sé específico**: "la roja" es mejor que solo "roja"

## 📝 Notas

- Los campos son **opcionales**: si no los incluyes, el logo funciona normalmente
- Las búsquedas son **case-insensitive** (no distinguen mayúsculas/minúsculas)
- La penalización es **acumulativa**: más keywords negativas = mayor penalización
- Los logos con `exclusions` coincidentes son **saltados por completo** en el loop
