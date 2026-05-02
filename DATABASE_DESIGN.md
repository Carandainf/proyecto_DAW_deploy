# 🗄️ DATABASE_DESIGN.md

> Diseño integral de la base de datos del proyecto DAW: Sistema de Laboratorio Dental.
>
> Última actualización: `24/04/2026` · Versión actual: `v0.8.5`

---

# 📦 Stack Tecnológico de Datos

| Tecnología      | Versión | Motivo                                                        |
| --------------- | ------- | ------------------------------------------------------------- |
| `SQLite`        | Última  | Base de datos relacional ligera y portable para entorno DAW   |
| `Prisma`        | `7.6.x` | ORM con tipado estricto y sincronización con TypeScript       |
| `Better Auth`   | `1.5.x` | Gestión de identidad con esquema extendido para roles         |
| `Prisma Studio` | Última  | Inspección y depuración visual de registros                   |
| `PostgreSQL`    | 16.x    | Base de datos relacional robusta en Vercel (Neon). Producción |

---

# 1. 🧱 Arquitectura del Esquema

La base de datos utiliza un esquema híbrido que combina tablas de sistema y tablas de negocio:

    Tablas Auth: Gestionadas por Better Auth (User, Session, Account).

    Tablas de Negocio: Personalizadas para la operativa dental (Archivo, Contacto).

---

# 2. 👤 Modelo `User` (Extendido)

El sistema implementa un doble control de acceso: un campo rápido role en User para Better Auth y una relación formal con la tabla roles.
Tabla: usuarios (User)

    Extensión Admin: Incluye campos para gestión de baneos (banned, banReason, banExpires).

    Relación de Rol: Vinculado a la tabla roles mediante roleId.

Tabla: roles (Role)

    Almacena las etiquetas de permisos (admin, user) y sus descripciones técnicas.

---

# 3. 📂 Entidades de Negocio (Producción)

Tabla: archivos (Archivo)

Es la entidad central del flujo de trabajo del laboratorio.

    Trazabilidad: Registra fecha_subida y fecha_recepcion.

    Estado y Prioridad: Control mediante Strings (pendiente, recibido, completado / normal, urgente).

    Integridad: Si un usuario es eliminado, sus archivos se borran en cascada (onDelete: Cascade).

Tabla: mensajes (Mensaje)

Permite la comunicación técnica vinculada a un archivo específico.

    Relación Triple: Une al emisor (User) con un archivo concreto.

    Orden: Historial cronológico mediante fecha_envio.

---

# 4. 📬 Modelo Contacto (Trazabilidad y Seguridad)

Diseñada para capturar leads y consultas técnicas desde la landing page.

    Auditoría: Incluye id_admin para saber qué administrador gestionó la consulta.

    Seguridad: El id_admin se mantiene como SetNull si el administrador es eliminado, preservando la integridad del registro del mensaje.

# 5. 🔗 Relaciones entre Tablas

## Relación Principal

`Relación Tipo Descripción
User ↔ Role M:1 Un rol puede pertenecer a muchos usuarios.
User ↔ Archivo 1:N Un doctor (user) puede subir múltiples trabajos STL.
Archivo ↔ Mensaje 1:N Un trabajo puede tener un hilo de comentarios técnicos.
User ↔ Contacto 1:N Un administrador gestiona múltiples solicitudes de contacto.

---

# 6. 🧪 Seed Inicial y Datos Base

Se ha definido una semilla inicial para garantizar los roles mínimos del sistema.

## Roles Iniciales

| Rol     | Función                                   |
| ------- | ----------------------------------------- |
| `admin` | Gestión global del laboratorio            |
| `user`  | Cliente con acceso a sus propios archivos |

## Objetivo del Seed

- Facilitar pruebas rápidas.
- Evitar registros manuales repetitivos.
- Garantizar que existan perfiles administrativos desde el primer arranque.

---

# 7. 🔐 Seguridad y Restricciones de Acceso

La capa de datos debe validar siempre la relación entre sesión y `id_usuario`.

## Regla Crítica

Un usuario sólo puede consultar o descargar archivos cuyo `id_usuario` coincida con su sesión.

```ts
where: {
  id_usuario: session.user.id;
}
```

## Riesgo Evitado

Sin esta validación, un usuario podría acceder a archivos ajenos manipulando el ID desde la URL o la petición.

---

# 8. 🛡️ Integridad y Seguridad de Datos

    Aislamiento de Multi-inquilino: Todas las consultas en los Dashboards incluyen un filtro forzoso where: { id_usuario: session.user.id } para evitar el acceso cruzado a datos.

    Validación de Sesión: La integridad referencial asegura que no se puedan subir archivos sin una sesión válida vinculada.

    Honeypot Logic: Aunque el campo Honeypot no se persiste en la DB para ahorrar espacio, la capa de datos rechaza cualquier creación (prisma.contacto.create) si el middleware de seguridad detecta actividad de bot.

---

# 9. 🚀 Estado de Implementación

## 📦 Funcionalidades

| Funcionalidad                                   | Estado |
| ----------------------------------------------- | ------ |
| Migraciones Prisma ejecutadas                   | ✅     |
| Campo `prioridad` añadido                       | ✅     |
| Campo `descripcion` añadido                     | ✅     |
| Roles iniciales (`admin` / `user`)              | ✅     |
| Relación `User → Archivo` funcional             | ✅     |
| Captura automática de `id_usuario` desde sesión | ✅     |
| Datos integrados con exportación PDF            | ✅     |
| Enums Nativos                                   | 🚧     |

---

## 🗄️ Modelo de Datos

| Tabla / Atributo | Estado | Notas                                               |
| ---------------- | ------ | --------------------------------------------------- |
| User (Roles)     | ✅     | Funcionando en login y registro                     |
| Archivo (STL)    | ✅     | Vinculado a la subida física de archivos            |
| Contacto         | ✅     | Soporte completo de trazabilidad administrativa     |
| Trazabilidad     | ✅     | Campos `id_admin` y `fecha_gestion` operativos      |
| Enums            | 🚧     | Pendiente migrar `String` a `Enum` nativo en Prisma |

---

# 10. 🚀 Estado de la Base de Datos

    [x] Generador: Cliente generado en ../generated/prisma.

    [x] Mapeo: Nombres de tablas en plural y español (usuarios, sesiones, etc.).

    [x] Cascada: Borrado inteligente implementado en Archivos y Mensajes.

    [x] Auditoría: Trazabilidad de gestión en Contactos finalizada.
