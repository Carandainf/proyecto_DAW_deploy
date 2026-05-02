# Changelog

Todos los cambios importantes del proyecto `proyecto_DAW` se documentarán en este archivo.

El formato está inspirado en Keep a Changelog y versionado semántico.

---

# [0.9.5] - 2026-05-02

## Añadido

- **Infraestructura Cloud (Vercel)**:
  - Despliegue oficial en Vercel bajo el plan Hobby.
  - Migración de base de datos de `SQLite` a `PostgreSQL` (Vercel Postgres/Neon).
  - Configuración de variables de entorno seguras (SMTP, Auth Secret, Database URL).
- **Control de Versiones para Producción**:
  - Creación de rama específica `deploy-vercel` para separar el entorno local del entorno de producción.
- **Auditoría Documental**:
  - Actualización masiva de `README.md`, `DEV_NOTES.md`, `PROJECT_ARCHITECTURE.md` y `DATABASE_DESIGN.md` para reflejar el stack final de producción.

## Corregido

- **Compatibilidad de Entorno**: Solucionado el conflicto de saltos de línea (CRLF/LF) mediante la configuración de `core.autocrlf` en Git para asegurar builds limpios en Vercel (Linux).

---

# [0.9.2] - 2026-04-30

## Añadido

- **Centro de Ayuda y Soporte**:
  - Implementación de `Faq.astro` con sistema de acordeones para resolver dudas frecuentes de los dentistas.
- **Flujo de Recuperación de Identidad**:
  - Creación de páginas `forgot-password.astro` y `reset-password.astro` para completar el ciclo de seguridad de Better Auth.
- **Rediseño de Landing Page (UI Avanzada)**:
  - `Hero.astro`: Nuevo diseño de impacto visual para la cabecera.
  - `ServiciosBento.astro`: Presentación de servicios del laboratorio mediante rejilla Bento.
  - `TeamBento.astro`: Sección de equipo con diseño moderno y minimalista.
  - `TechStack.astro`: Componente informativo que muestra las tecnologías del proyecto (Astro, Prisma, etc.).
- **Gestión de Errores**:
  - Creación de página `404.astro` personalizada para redirigir a los usuarios perdidos de vuelta al inicio.

## Cambiado

- **Refinamiento Estético**:
  - Ajuste de tipografías globales y espaciados en Tailwind 4 para mejorar la legibilidad en resoluciones móviles.
  - Optimización de carga de fuentes locales ("Inter Variable") para evitar el layout shift.

---

# [0.9.0] - 2026-04-23

## Añadido

- **Sistema de Notificaciones por Email**:
  - Integración de Nodemailer con transporte SMTP para envíos profesionales.

    Automatización de correos de confirmación para el formulario de contacto y flujos de registro.

- **Blindaje de Subida de Archivos (STL)**:

        Implementación de validaciones técnicas en servidor: límite de tamaño (20MB), verificación de extensión MIME y sanitización de nombres de archivo.

        Mejora de la seguridad para evitar ataques de Path Traversal y denegación de servicio (DoS).

- **Trazabilidad Completa de Mensajería**:

        Implementación funcional de la tabla Mensaje: vinculación directa entre hilos de conversación y archivos STL específicos.

        Registro de auditoría para administradores (id_admin y fecha_gestion) totalmente operativo en la base de datos.

## Cambiado

- **Refactorización de la Capa de Datos**:

        Actualización del esquema Prisma a la versión final con relaciones de borrado en cascada (onDelete: Cascade) para mantener la integridad de la base de datos.

        Mejora del motor de búsqueda en los Dashboards para filtrar registros por el ID de sesión del usuario autenticado (Aislamiento Multi-inquilino).

## Corregido

    Sincronización de Sesión y Rol: Solucionado el desfase temporal tras el login forzando la recuperación de la sesión mediante authClient.getSession() antes de la redirección al dashboard.

    Persistencia de Metadatos: Corregido el error por el cual los comentarios técnicos no se vinculaban correctamente al ID del archivo en el proceso de subida.

---

# [0.8.5] - 2026-04-12

## Añadido

- **Sistema de Contacto Seguro**:
  - Implementación del componente `ContactForm.astro` con validación en servidor.
  - Protección Anti-Spam activa mediante técnica **Honeypot** (campos invisibles para bloquear bots sin captchas).
  - Creación del endpoint API `/api/contacto/enviar.ts` para el procesamiento seguro de consultas.

- **Arquitectura Legal Integrada**:
  - Nuevas rutas obligatorias RGPD/LSSI:
    - `/privacidad`
    - `/aviso-legal`
    - `/cookies`
  - Configuración de cookies técnicas sin necesidad de banner intrusivo (sin tracking de terceros).

- **Trazabilidad Administrativa**:
  - Extensión del esquema Prisma en la tabla `Contacto`:
    - `id_admin`
    - `fecha_gestion`
  - Preparación de la base de datos para auditoría interna (quién respondió y cuándo).

## Cambiado

- **Refactorización del Layout Base**:
  - Implementación de **Sticky Footer** con Flexbox (`min-h-screen` + `flex-grow`).
  - Renderizado condicional en `Layout.astro` para ocultar/simplificar el footer en páginas legales.

- **Mejora de la UI Corporativa**:
  - Actualización del componente `Footer.astro` con enlaces dinámicos y diseño adaptativo.

## Corregido

- **Error de Renderizado de Slots**:
  - Solucionado problema de autocierre en `Layout.astro` que rompía el árbol DOM.

- **Validación de Tipos en API**:
  - Corregidos conflictos de tipado al extraer datos desde `FormData` en el endpoint de contacto.

- **Ajustes de UX Legal**:
  - Eliminado layout shift en dispositivos móviles en páginas legales.

---

# [0.7.0] - 2026-04-07

## Añadido

- **Generación de Informes PDF**:
  - Integración de las librerías `jsPDF` y `jspdf-autotable` para la exportación de datos en el cliente.
  - Diseño de plantilla de informe corporativo con branding visual (colores `dent-accent` y `dent-dark`), líneas decorativas y paginación automática.
  - Implementación de la directiva `define:vars` de Astro para transferir datos de servidor (Prisma) al motor de generación de PDF en el cliente sin peticiones extra.
- **Gestión de Roles en Registro**:
  - Actualización del formulario de registro para permitir la selección de rol (`admin` / `user`) mediante un componente `select` vinculado.
  - Configuración de la propiedad `input: true` en `additionalFields` de Better Auth para permitir la entrada de metadatos de rol desde el frontend.
- **Refactorización de UX en Historial**:
  - Reubicación estratégica del botón de descarga en la cabecera del dashboard para mejorar la jerarquía visual.
  - Implementación de estados de "hover" y transiciones en la tabla de registros para una navegación más fluida.

## Cambiado

- **Entorno de Desarrollo (DX)**:
  - Configuración avanzada de VS Code/Antigravity mediante `settings.json`:
    - Implementación de `editor.formatOnSave` vinculado a **Prettier**.
    - Configuración de formateadores específicos para `.astro`, `.ts`, `.js` y `.css`.
    - Instalación y configuración de `prettier-plugin-astro` para resolver problemas de indentación en componentes Astro.
- **Lógica de Autenticación**:
  - Mejora del flujo de redirección post-login: ahora se recupera la sesión completa mediante un `fetch` a `/api/auth/get-session` inmediatamente después del `sign-in` para asegurar la detección correcta del rol antes de la redirección.

## Corregido

- **Conflictos de Tipado Estricto**:
  - Solucionado error `ts(7006)` (any implícito) definiendo interfaces para los parámetros de peticiones asíncronas.
  - Corregido error `ts(18046)` en bloques `catch` mediante la validación de instancia `err instanceof Error`.
  - Resuelto error `ts(2345)` en el manejo de eventos de formulario forzando el tipado de `e.target` como `HTMLFormElement`.
- **Configuración del Formateador**: Corregida la asociación del ID de extensión en `editor.defaultFormatter` de `withastro.prettier-plugin-astro` a `astro-build.astro-vscode`.

---

# [0.6.0] - 2026-04-05

## Añadido

- **Dashboard de Cliente (Bento Grid)**:
  - Diseño avanzado tipo "Bento" con rejilla responsive (`grid-cols-1 md:grid-cols-3`).
  - Integración de **Tailwind CSS 4** con variables de color personalizadas para el sector dental (`dent-card`, `dent-border`, `dent-accent`).
  - Implementación de fuentes locales ("Inter") para cumplimiento de privacidad y rendimiento.
- **Sistema de Gestión de Archivos STL**:
  - Creación de Endpoint API `src/pages/api/upload.ts` para procesamiento de archivos `multipart/form-data`.
  - Lógica de guardado físico en `/public/uploads` con renombrado único mediante _timestamps_ para evitar colisiones de archivos.
  - Vinculación automática de archivos con el `id` de usuario de la sesión activa de Better Auth.
- **Experiencia de Usuario (UX) Pro**:
  - **Zona Dropzone**: Implementada funcionalidad _Drag & Drop_ nativa mediante JavaScript para captura de archivos.
  - **Feedback Visual**: Efectos de escala (`scale-101`) y cambio de color cian al arrastrar archivos sobre la zona de carga.
  - **Estado de Éxito**: Pantalla de confirmación animada integrada en el Bento Grid tras una subida correcta, eliminando el uso de `alert()` nativos.

## Cambiado

- **Esquema de Base de Datos (Prisma)**:
  - Evolución del modelo `Archivo` para soportar flujo de trabajo real:
    - Añadido `url_path` para localización de archivos en el servidor.
    - Añadido `descripcion` (String opcional) para observaciones técnicas del dentista.
    - Añadido `prioridad` (String) para gestión de urgencias (Normal/Urgente).
- **Configuración de Prisma v7**:
  - Migración de la lógica de _seeding_ al nuevo estándar `prisma.config.ts`.
  - Configuración de la propiedad `migrations.seed` para ejecutar el script mediante `tsx`.

## Corregido

- **Desfase de Tipado (Prisma/TypeScript)**: Solucionado error `ts(2353)` mediante la regeneración forzada del cliente con `npx prisma generate`.
- **Persistencia de Formulario**: Implementado `form.reset()` tras subida exitosa para limpiar estados del navegador (observaciones y prioridad).
- **Interrupción de Navegador en Dropzone**: Corregido el comportamiento por defecto donde el navegador intentaba abrir el archivo `.stl` en lugar de procesar la subida.

---

# [0.5.0] - 2026-04-03

## Añadido

- **Sistema de Roles y Autorización**:
  - Implementado mapeo de campo `role` en la configuración de Better Auth.
  - Creado helper `getUserRole(request)` en `src/lib/auth.ts` para extraer sesión y rol de forma centralizada.
  - Creado helper `protectRoute(request, role)` para gestionar redirecciones automáticas basadas en permisos.
- **Navegación Dinámica**:
  - Nuevo componente `src/components/Navbar.astro`.
  - Menú adaptativo: muestra enlaces de "Panel Admin" o "Mis Pedidos" según el rol detectado en la cookie de sesión.
- **Estructura de Dashboards**:
  - Creada ruta protegida `/dashboard/admin/index.astro`.
  - Creada ruta protegida `/dashboard/cliente/index.astro`.
- **Redirecciones Automáticas**:
  - Implementada lógica de redirección post-login: los administradores van a `/admin` y los usuarios a `/cliente`.
  - Protección "cross-role": un usuario estándar es rebotado si intenta acceder manualmente a la URL de administración.

## Cambiado

- **Refactorización de Endpoints API**:
  - Migración de endpoints de prueba manuales (`/api/auth-test/...`) al manejador dinámico oficial de Better Auth.
  - Configuración del catch-all route en `src/pages/api/auth/[...all].ts`.
- **Actualización de Dependencias**:
  - Forzada la versión de `@prisma/client` y `prisma` a la **7.6.0** para asegurar compatibilidad con el adapter.
  - Instalación de `@opentelemetry/api` como dependencia necesaria para el motor de Better Auth 1.5.

## Corregido

- **Error 404 en Rutas de Autenticación**:
  - Corregidas las URLs de los formularios en el frontend para coincidir con la versión 1.5.x:
    - `/api/auth/sign-up/email` (con guiones y barras).
    - `/api/auth/sign-in/email`.
- **Error de TypeScript `basePath`**: Eliminada propiedad obsoleta en la configuración `advanced` de Better Auth.
- **Error de Tipado en Componentes**: Corregido el error de "posible nulo" en `user.name` mediante el uso de encadenamiento opcional (`user?.name`) en el Navbar y Dashboards.
- **Persistencia de Sesión**: Corregido problema de pérdida de sesión en redirecciones mediante la inclusión de `credentials: "include"` en las peticiones fetch de validación.

---

# [0.4.0] - 2026-04-01

## Añadido

- Configuración completa de Better Auth con Prisma Adapter.
- Endpoints API para autenticación:
  - `/api/auth-test/register`
  - `/api/auth-test/login`
  - `/api/auth-test/session`
  - `/api/auth-test/logout`

- Página `/test-auth` para pruebas de autenticación.
- Formularios funcionales de:
  - Register
  - Login
  - Get Session
  - Logout

- Salida JSON en tiempo real para visualizar respuestas de la API.
- Gestión de sesión mediante cookies.
- Configuración de Astro con:

```js
output: "server";
```

- Diseño inicial tipo Bento Grid responsive en `/test-auth`.
- Tarjetas con tamaños variables y comportamiento dinámico según el contenido.
- Soporte responsive para escritorio, tablet y móvil.
- Animaciones hover y transición en las tarjetas.

## Cambiado

- Migración definitiva a Tailwind CSS 4.
- Sustituida la configuración antigua de Tailwind 3.
- Eliminado el uso de:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- Sustituido por:

```css
@import "tailwindcss";
```

- Cambio de `postcss.config.cjs` a `postcss.config.mjs`.
- Nuevo contenido de `postcss.config.mjs`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- Eliminado el plugin `@tailwindcss/vite` del archivo `astro.config.mjs` por incompatibilidad con Astro 5 y Vite.
- Simplificado `astro.config.mjs` a:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
});
```

## Corregido

- Error de incompatibilidad entre versiones de Vite y `@tailwindcss/vite`.
- Error:

```text
Type 'Plugin<any>[]' is not assignable to type 'PluginOption'
```

- Error de Tailwind 4 relacionado con:

```text
Missing "./base" specifier in "tailwindcss" package
```

- Error de PostCSS:

```text
It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin
```

- Error en login por enviar `name` en lugar de `email`.
- Corregido el formulario de login para enviar:

```ts
const loginData = {
  email: form.get("email"),
  password: form.get("password"),
};
```

- Corregido el problema por el que `session` devolvía `null` tras iniciar sesión.
- Corregida la gestión de cookies necesaria para que Better Auth mantenga la sesión.
- Solucionado el problema visual donde las tarjetas Bento se superponían.
- Corregido el tamaño excesivo de los ladrillos, que hacía que apareciesen uno debajo de otro.
- Corregidos los botones que quedaban fuera de sus tarjetas.
- Corregida la superposición entre las tarjetas `Register` y `Logout`.

---

# [0.3.0] - 2026-03-30

## Añadido

- Configuración inicial de Tailwind CSS 4.
- Archivo `global.css` con:

```css
@import "tailwindcss";
```

- Importación global de estilos desde `Layout.astro`.
- Primer diseño responsive para la página `/test-auth`.
- Primeros experimentos con Bento Grid usando CSS Grid y Tailwind.

## Cambiado

- El proyecto pasa de una interfaz básica vertical a una estructura visual basada en tarjetas.
- El layout general cambia a fondo oscuro con tipografía clara.

---

# [0.2.0] - 2026-03-29

## Añadido

- Integración de Better Auth.
- Configuración de Prisma Adapter.
- Registro de usuarios con email y contraseña.
- Login de usuarios.
- Persistencia de sesiones en SQLite.
- Roles iniciales `admin` y `user` creados mediante seed.
- Configuración del archivo `.env` con:
  - `DATABASE_URL`
  - `BETTER_AUTH_SECRET`
  - `BETTER_AUTH_URL`

## Cambiado

- El proyecto deja de ser completamente estático y pasa a usar `output: "server"`.

---

# [0.1.0] - 2026-03-28

## Añadido

- Creación inicial del proyecto con Astro 5 + TypeScript.
- Integración de Prisma 7.
- Base de datos SQLite funcionando.
- Archivo `schema.prisma` inicial.
- Archivo `seed.ts` para insertar datos iniciales.
- Página `/prueba-db` para comprobar conexión a base de datos.
- Configuración inicial de GitHub.
- README inicial del proyecto.

## Añadido --Tailwind CSS y preparación del panel de autenticación

- Tailwind CSS instalado y funcionando.
- Archivo `src/styles/global.css` configurado.
- Layout base `src/layouts/Layout.astro` creado.
- Estructura de páginas actualizada:

```text
src/pages/
├── index.astro
├── prueba-db.astro
└── test-auth.astro
```

- Definido el panel `/test-auth`.
- Decisión tomada de usar:
  - formularios HTML en Astro
  - `fetch()` con URLs absolutas
  - `credentials: "include"`

- Endpoints previstos:

```text
/api/auth-test/register
/api/auth-test/login
/api/auth-test/session
/api/auth-test/logout
```

**Estado:** 🟢 En progreso

### Hitos logrados

- Tailwind CSS instalado y funcionando.
- Archivo `src/styles/global.css` configurado.
- Layout base `src/layouts/Layout.astro` creado.
- Estructura de páginas actualizada:

```text
src/pages/
├── index.astro
├── prueba-db.astro
└── test-auth.astro
```

- Definido el panel `/test-auth`.
- Decisión tomada de usar:
  - formularios HTML en Astro
  - `fetch()` con URLs absolutas
  - `credentials: "include"`

- Endpoints previstos:

```text
/api/auth-test/register
/api/auth-test/login
/api/auth-test/session
/api/auth-test/logout
```

### Próximos pasos

- Crear formularios de register y login.
- Implementar lectura de sesión.
- Implementar logout.
- Añadir protección de rutas según sesión.
- Empezar autorización por roles.

---

## 📌 Estado actual del proyecto

- SQLite funcionando.
- Prisma 7.5.x funcionando.
- Better Auth funcionando.
- Tailwind CSS funcionando.
- Roles iniciales creados.
- Proyecto sincronizado entre varios equipos.
- Próximo objetivo: completar `/test-auth`.

---

## 📅 [2026-03-18] - Integración de Better Auth

**Estado:** 🟢 Completado

### Hitos logrados

- Better Auth instalado y configurado.
- Archivo `src/lib/auth.ts` creado.
- Better Auth conectado a Prisma mediante Prisma Adapter.
- Variables de entorno añadidas:

```env
BETTER_AUTH_SECRET="<secret aleatorio>"
BETTER_AUTH_URL="http://localhost:4321"
```

- Login mediante email + contraseña habilitado.
- Gestión de sesiones habilitada.
- Configuración corregida para usar `expiresIn` en lugar de `maxAge`.
- Proyecto actualizado a Prisma 7.5.x.
- Requisito de Node.js actualizado a:

```text
>= 20.19
```

- `npx prisma generate` ejecutado correctamente tras la actualización.
- Compatibilidad verificada en dos equipos distintos mediante GitHub.

### Resultado

- Flujo actual operativo:

```text
UI (Astro) → API (Astro endpoints) → Better Auth → Prisma → SQLite
```

---

## 📅 [2026-03-10] - Configuración de Prisma + SQLite

**Estado:** 🟢 Completado

### Hitos logrados

- Prisma configurado con SQLite.
- `schema.prisma` creado y funcionando.
- Prisma Client generado correctamente.
- Cliente global en `src/lib/prisma.ts` para evitar múltiples conexiones.
- Base de datos SQLite operativa mediante:

```env
DATABASE_URL="file:./prisma/dev.db"
```

- Seed ejecutado correctamente.
- Roles iniciales creados:
  - `admin`
  - `user`

- Página `prueba-db.astro` creada para verificar lectura desde la base de datos.
- Tipado generado para todos los modelos de Prisma.

### Resultado

- Conexión a base de datos verificada.
- Lectura de datos funcionando correctamente.

---

## 📅 [2026-02-27] - Configuración inicial del proyecto

**Estado:** 🟢 Completado

### Hitos logrados

- Proyecto Astro creado con TypeScript en modo estricto.
- Dependencias instaladas mediante `npm`.
- Repositorio Git inicializado y conectado con GitHub.
- VS Code configurado con:
  - Astro
  - Tailwind CSS IntelliSense
  - Prisma
  - ESLint
  - Prettier
  - Error Lens
  - GitLens

- Configuración inicial de `settings.json`:
  - `formatOnSave`
  - auto-fix de ESLint
  - soporte Tailwind en `.astro`
