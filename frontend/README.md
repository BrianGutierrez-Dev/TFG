# Frontend - TFG BlackList

Frontend de la aplicación **BlackList**, desarrollado con Angular. Esta parte del proyecto implementa la interfaz de gestión para clientes, vehículos, contratos de alquiler, incidencias, mantenimientos, reparaciones y empleados.

La aplicación consume la API del backend a través de rutas `/api` y utiliza autenticación mediante token JWT.

## Tecnologías principales

- Angular 21
- TypeScript
- Tailwind CSS
- RxJS
- Lucide Angular
- npm workspaces

## Requisitos

Antes de arrancar el frontend, asegúrate de tener instalado:

- Node.js compatible con Angular 21
- npm
- Las dependencias del proyecto instaladas

Desde la raíz del repositorio:

```bash
npm install
```

También puedes instalar dependencias entrando directamente en esta carpeta:

```bash
cd frontend
npm install
```

## Arrancar en desarrollo

Desde la raíz del repositorio:

```bash
npm run dev -w frontend
```

O desde la carpeta `frontend`:

```bash
npm run dev
```

La aplicación se abrirá en:

```text
http://localhost:4200
```

El servidor de desarrollo recarga automáticamente la aplicación cuando se modifican archivos del frontend.

## Backend y proxy

El frontend llama al backend usando rutas relativas que empiezan por `/api`.

La configuración del proxy está en:

```text
proxy.conf.json
```

Actualmente redirige las peticiones `/api` a:

```text
http://localhost:3000
```

Por tanto, para usar la aplicación completa en local, el backend debe estar arrancado en el puerto `3000`.

Desde la raíz del proyecto se puede levantar frontend y backend a la vez con:

```bash
npm run dev
```

## Scripts disponibles

Dentro de `frontend/package.json` están definidos estos scripts:

```bash
npm run dev
```

Arranca Angular en modo desarrollo usando la configuración `development`.

```bash
npm start
```

Arranca el servidor de Angular con la configuración por defecto.

```bash
npm run build
```

Compila el frontend para producción y genera los archivos en `dist/`.

```bash
npm run watch
```

Compila en modo observación usando la configuración de desarrollo.

## Estructura del proyecto

```text
frontend/
├── public/                 # Recursos estáticos
├── src/
│   ├── app/
│   │   ├── core/           # Servicios, modelos, guards e interceptores
│   │   ├── features/       # Pantallas principales de la aplicación
│   │   ├── layout/         # Layout general y barra de navegación
│   │   ├── shared/         # Componentes reutilizables
│   │   ├── app.config.ts   # Configuración global de Angular
│   │   ├── app.routes.ts   # Rutas de la aplicación
│   │   └── app.ts          # Componente raíz
│   ├── main.ts             # Punto de entrada
│   └── styles.css          # Estilos globales y Tailwind
├── angular.json            # Configuración de Angular
├── proxy.conf.json         # Proxy hacia el backend
└── package.json            # Dependencias y scripts del frontend
```

## Módulos funcionales

La aplicación está organizada por funcionalidades dentro de `src/app/features`:

- `login`: inicio de sesión.
- `dashboard`: panel principal.
- `blacklist`: listado de clientes en lista negra.
- `clients`: gestión y detalle de clientes.
- `cars`: gestión de vehículos.
- `rentals`: contratos de alquiler y detalle de contrato.
- `incidents`: gestión de incidencias.
- `maintenances`: mantenimientos de vehículos.
- `repairs`: reparaciones.
- `employees`: gestión de empleados, disponible para usuarios administradores.

## Autenticación

El estado de sesión se gestiona desde:

```text
src/app/core/services/auth.service.ts
```

El token JWT y los datos básicos del empleado se guardan en `localStorage`.

Las rutas principales están protegidas por:

```text
src/app/core/guards/auth.guard.ts
```

Además, el interceptor:

```text
src/app/core/interceptors/auth.interceptor.ts
```

añade automáticamente la cabecera `Authorization: Bearer <token>` a las peticiones HTTP cuando existe un token. Si el backend responde con `401`, se limpia la sesión y se redirige al login.

## Rutas principales

Las rutas están definidas en:

```text
src/app/app.routes.ts
```

Rutas disponibles:

- `/login`
- `/`
- `/blacklist`
- `/clients`
- `/clients/:id`
- `/cars`
- `/rentals`
- `/rentals/:id`
- `/incidents`
- `/maintenances`
- `/repairs`
- `/employees`

## Estilos

El proyecto usa Tailwind CSS y estilos globales definidos en:

```text
src/styles.css
```

En ese archivo se centralizan estilos base, formularios, tablas, modales, tarjetas y pestañas de filtrado.

La configuración de Tailwind está en:

```text
tailwind.config.js
```

## Convenciones de desarrollo

- Mantener los componentes de pantalla dentro de `src/app/features`.
- Mantener la comunicación con API dentro de `src/app/core/services`.
- Mantener interfaces y tipos compartidos en `src/app/core/models`.
- Reutilizar componentes comunes desde `src/app/shared/components`.
- Usar rutas relativas `/api/...` para que el proxy funcione correctamente en desarrollo.
- Evitar lógica de negocio pesada en los componentes; debería quedar en servicios o en el backend.

## Compilación para producción

Desde la carpeta `frontend`:

```bash
npm run build
```

Desde la raíz del repositorio:

```bash
npm run build -w frontend
```

El resultado se genera en:

```text
frontend/dist/
```

## Notas

Este README documenta únicamente el frontend. Para arrancar el sistema completo, revisar también la configuración del backend y los scripts definidos en el `package.json` raíz.
