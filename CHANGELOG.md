# Registro de Cambios

Nombre: Brian

---

| Fecha       | Cambio                                                                                                    | Commit                                  |
|-------------|-----------------------------------------------------------------------------------------------------------|-----------------------------------------|
| 29/04/2026  | Regeneración del cliente Prisma (`prisma generate`) para los campos `blacklistReason` y `blacklistedAt`   | 945ef3a                                 |
| 29/04/2026  | Eliminación de `validateBody` en la ruta PUT `/api/clients/:id`                                           | c4ee1a2                                 |
| 29/04/2026  | Fix del middleware de validación: `whitelist: false`, sin reemplazar `req.body` con la instancia DTO      | c4ee1a2                                 |
| 29/04/2026  | Fix del binding de `blacklistReasonText`: signal → propiedad plana + variable de template `#reasonInput`  | c4ee1a2                                 |
| 29/04/2026  | Expansión del buscador en todas las secciones (vehículos, empleados, incidencias, mantenimientos, alquileres, reparaciones) | c4ee1a2                  |
| 29/04/2026  | Eliminación del filtro Todos/Blacklist en la lista de clientes                                            | c4ee1a2                                 |
| 29/04/2026  | Instalación de `class-transformer` y `class-validator` tras el merge                                     | 945ef3a                                 |
| 29/04/2026  | Resolución del conflicto de merge en `client-list` (blacklist binding)                                   | 945ef3a                                 |

---

Nombre: Carlos

---

| Fecha       | Cambio                                                                 | Commit                    |
|-------------|------------------------------------------------------------------------|---------------------------|
| 29/04/2026  | Marcado automático de contratos vencidos como OVERDUE al iniciar y consultar contratos | C -> [1.2.34] |
| 29/04/2026  | Dashboard ejecutivo con ingresos mensuales, disponibilidad, reparaciones, clientes problemáticos y mantenimientos a 15 días | C -> [1.2.33] |
| 29/04/2026  | Buscador de vehículo por matrícula o modelo con bloqueo visual de no disponibles en contratos | C -> [1.2.32] |
| 29/04/2026  | Validación de disponibilidad real de vehículos por solape de fechas en contratos | C -> [1.2.31] |
| 29/04/2026  | Renombrado de métricas del dashboard a incidencias activas y reparaciones pendientes | C -> [1.2.30] |
| 29/04/2026  | Paginación de incidencias, mantenimiento, vehículos y reparaciones cada 10 registros | C -> [1.2.28] |
| 29/04/2026  | Paginación de clientes y contratos cada 10 registros                   | C -> [1.2.27]             |
| 29/04/2026  | Gestión de baja y despido de empleados con bloqueo de acceso           | C -> [1.2.26]             |
| 29/04/2026  | Cliente obligatorio marcado visualmente en nueva incidencia            | C -> [1.2.25]             |
| 29/04/2026  | Cliente obligatorio marcado visualmente en nuevo contrato              | C -> [1.2.24]             |
| 29/04/2026  | Descripción obligatoria con mínimo de 3 caracteres en mantenimientos   | C -> [1.2.23]             |
| 29/04/2026  | Propietario obligatorio al crear o editar vehículos                    | C -> [1.2.22]             |
| 29/04/2026  | Filtro de prioridad en incidencias                                     | C -> [1.2.21]             |
| 28/04/2026  | Búsqueda por DNI en el listado de contratos                            | C -> [1.2.20]             |
| 28/04/2026  | Búsqueda de vehículo por matrícula o modelo en reparaciones            | C -> [1.2.19]             |
| 28/04/2026  | Búsqueda de vehículo por matrícula o modelo en mantenimientos          | C -> [1.2.18]             |
| 28/04/2026  | Búsqueda de cliente por nombre o DNI en contratos, incidencias y coches | C -> [1.2.17]             |
| 28/04/2026  | Dashboard con próximas devoluciones en los siguientes 3 días           | C -> [1.2.16]             |
| 28/04/2026  | Ficha de cliente con contratos, incidencias y vehículos asignados      | C -> [1.2.15]             |
| 28/04/2026  | Dashboard muestra devoluciones pendientes para el día de hoy           | C -> [1.2.14]             |
| 28/04/2026  | Validaciones en formulario de clientes y mensajes de error al eliminar | C -> [1.2.13]             |
| 28/04/2026  | Validaciones integridad referencial y endpoint DELETE contratos         | C -> [1.2.12]             |
| 28/04/2026  | Validaciones en creación de reparaciones                               | C -> [1.2.11]             |
| 28/04/2026  | Coste obligatorio mayor que uno en mantenimientos                      | C -> [1.2.10]             |
| 28/04/2026  | Ajuste de descripción opcional en mantenimientos                       | C -> [1.2.9]              |
| 28/04/2026  | Validaciones en creación de mantenimientos                             | C -> [1.2.8]              |
| 28/04/2026  | Marcado explícito de campos obligatorios en vehículos                  | C -> [1.2.7]              |
| 28/04/2026  | Validaciones en formulario de vehículos                                | C -> [1.2.6]              |
| 28/04/2026  | Validaciones en creación de incidencseias                                | C -> [1.2.5]              |
| 28/04/2026  | Bloqueo de contratos con precio total a cero                           | C -> [1.2.4]              |
| 28/04/2026  | Limpieza de validaciones en formulario de clientes                     | C -> [1.2.3]              |
| 28/04/2026  | Validación de fechas en creación de contratos                          | C -> [1.2.2]              |
| 28/04/2026  | Fix en la señal `blacklistReasonText` del componente `client-list`     | C -> [1.2.1]              |
| 28/04/2026  | Validaciones con `class-validator` para Client, Employee y Auth        | C -> [1.2.0]              |
| 28/04/2026  | Campos de blacklist añadidos y gestión de clientes actualizada         | feat: add blacklist fields |
| 28/04/2026  | Restructuración de modales y estilos en varios componentes             | refactor: modals & styles |
| 27/04/2026  | Configuración de PostCSS y Tailwind CSS                                | chore: postcss & tailwind |
| 27/04/2026  | Corrección de `rootDir` en `tsconfig.app.json`                         | fix: tsconfig rootDir     |
| 27/04/2026  | Opciones de `<select>` actualizadas para usar `ngValue`                | refactor: ngValue binding |
| 27/04/2026  | Permiso de `curl` añadido a `settings.local.json`                      | add curl permission       |
| 27/04/2026  | Migración a la última versión de Angular                               | migrado Angular           |
| 23/04/2026  | Commit inicial del proyecto                                            | Initial commit            |
| 29/04/2026  | Merge -> [Resolución de conflictos con rama de Brian]                 | Merge -> [Resolución de conflictos con rama de Brian] |
