# BlackList

Aplicación web de gestión y reputación de clientes para talleres mecánicos.

> "Protege tu taller, conoce a tus clientes"

## Descripción

BlackList permite a los talleres mecánicos registrar clientes, consultar
su historial de comportamiento e identificar perfiles de riesgo antes de
aceptar un trabajo. Incluye además un módulo de gestión de flota de
vehículos de cortesía con control de contratos de alquiler y devoluciones.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 21 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript + Prisma ORM |
| Base de datos | PostgreSQL 15+ |

## Requisitos previos

- Node.js v18+
- npm v9+
- PostgreSQL 15+ instalado y en ejecución
- Angular CLI: `npm install -g @angular/cli`

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/briangutierrez/blacklist-app.git
cd blacklist-app
npm install
```

### 2. Configurar la base de datos

Crear una base de datos vacía en PostgreSQL:

```sql
CREATE DATABASE blacklist_db;
```

### 3. Configurar el backend

```bash
cd backend
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/blacklist_db?schema=public"
JWT_SECRET="tu_clave_secreta"
JWT_EXPIRES_IN="8h"
PORT=3000
```

Ejecutar las migraciones y generar el cliente Prisma:

```bash
cd ..
npm run prisma:migrate
npm run prisma:generate
```

Cargar datos de prueba (opcional):

```bash
npm run seed
```

### 4. Arrancar la aplicación

```bash
npm run dev
```

- API REST → http://localhost:3000  
- Aplicación web → http://localhost:4200

## Credenciales por defecto (tras el seed)

| Campo | Valor |
|-------|-------|
| Email | admin@taller.com |
| Contraseña | admin1234 |
| Rol | ADMIN |

## 💡 Guía rápida de prueba

Para comprobar el flujo principal del Trabajo de Fin de Grado (la automatización de la Lista Negra), sigue estos pasos:
1. Inicia sesión con las credenciales de administrador indicadas arriba.
2. Ve al módulo **Clientes** y observa a los usuarios en estado normal.
3. Ve al módulo **Devoluciones (CarReturn)** y registra una nueva devolución de vehículo.
4. Marca que el vehículo se ha devuelto con **daños encontrados** o fuera de plazo.
5. El backend creará automáticamente una **Incidencia**. Al acumular incidencias graves, el cliente pasará automáticamente a la **Lista Negra** y quedará bloqueado en el sistema.

## Estructura del proyecto

blacklist-app/
├── backend/
│   ├── prisma/          # Esquema y migraciones
│   └── src/
│       ├── controllers/ # Gestión de peticiones HTTP
│       ├── services/    # Lógica de negocio
│       ├── routes/      # Definición de endpoints
│       ├── middleware/  # Auth, validación, errores
│       └── dtos/        # Validación de datos de entrada
└── frontend/
    └── src/app/
        ├── core/        # Guards, interceptors, servicios
        ├── features/    # Módulos funcionales
        ├── layout/      # Navbar y estructura
        └── shared/      # Componentes reutilizables

## Autores

- Brian Gutiérrez
- Carlos Martín

CFGS Desarrollo de Aplicaciones Multiplataforma (DAM) · Curso 2025–2026
