# ⚽ Gol y te Quedas - Sistema de Gestión de Partidos

Aplicación web para gestionar partidos de fútbol estilo "gol y te quedas" (winner stays). Desarrollada con Next.js 15, React 19, TypeScript, Tailwind CSS y Zustand.

## 🎯 Características

- ✅ Gestión de equipos y cola de espera
- ✅ Timer configurable por partido
- ✅ Tabla de posiciones automática
- ✅ Historial editable de partidos
- ✅ Persistencia local automática
- ✅ Interfaz responsive y accesible
- ✅ Reglas de rotación automáticas

## 🏗️ Arquitectura

Este proyecto implementa una **arquitectura feature-driven** con separación clara de responsabilidades.

```
src/
├── domain/          # Lógica de negocio pura (testable)
├── store/          # Estado global con Zustand + persist
├── features/       # Módulos por funcionalidad
│   ├── match/      # Partido actual
│   ├── queue/      # Cola de espera
│   ├── leaderboard/
│   ├── teams/
│   ├── settings/
│   └── history/
├── components/     # Componentes compartidos
└── app/           # Pages de Next.js
```

📖 Ver documentación completa en [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🚀 Getting Started

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🎮 Cómo Funciona

### Reglas del Juego

1. **Arma la cola**: Agrega equipos en orden de juego
2. **Primer partido**: Define al defensor inicial
3. **Ganar**:
   - Por gol → El ganador se queda
   - Por timeout → El retador reemplaza al defensor
4. **Rotación**: El perdedor va al final de la cola
5. **Puntos**: 3 puntos por victoria, desempate por goles

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: Zustand con persistencia
- **Iconos**: React Icons
- **Linting**: ESLint

## 📁 Estructura del Proyecto

### Capa de Dominio (`src/domain/`)

Funciones puras sin dependencias de React:

- `colors.ts` - Generación de colores únicos
- `leaderboard.ts` - Cálculo de puntos y ranking
- `match.ts` - Reglas de partidos
- `queue.ts` - Gestión de cola

### Features (`src/features/`)

Cada feature incluye:

- `components/` - UI presentacional
- `hooks/` - Lógica y conexión al store
- `index.ts` - Exports públicos

### Store (`src/store/`)

Estado global con:

- Persistencia automática en localStorage
- Sincronización selectiva
- Migraciones de versión

## 🔄 Persistencia de Datos

Los siguientes datos se guardan automáticamente:

- ✅ Equipos y cola
- ✅ Historial de partidos
- ✅ Equipo defensor actual
- ✅ Configuración de duración

No se persiste el estado transitorio (timer, partido en curso).

## 🧪 Testing (Próximamente)

```bash
npm test              # Tests unitarios
npm run test:watch    # Modo watch
npm run test:coverage # Coverage
```

## 📝 Próximas Mejoras

- [ ] Tests unitarios y de integración
- [ ] Storybook para componentes
- [ ] PWA (app instalable)
- [ ] Exportar/importar datos
- [ ] Backend opcional (sync entre dispositivos)
- [ ] Modo multijugador en tiempo real

## 👤 Autor

**Emilio Andrich Guevara**

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
