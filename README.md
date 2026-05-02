# 🦷 proyecto_DAW: Sistema de Gestión de Laboratorio Dental

> Proyecto de Ciclo Formativo de Grado Superior (DAW) desarrollado con arquitectura moderna SSR, tipado estricto y control de acceso por roles.

> Última actualización: `23/04/2026` · Versión actual: `v0.8.5`

---

# 📦 Stack Tecnológico

| Tecnología   | Versión | Uso                                                         |
| ------------ | ------- | ----------------------------------------------------------- |
| Astro        | 5.x     | Framework principal con SSR                                 |
| TypeScript   | Última  | Tipado estricto en toda la aplicación                       |
| Tailwind CSS | 4.x     | Estilos con enfoque **CSS-first** (`@import "tailwindcss"`) |
| Prisma       | 7.x     | ORM para acceso a SQLite                                    |
| SQLite       | Última  | Base de datos relacional ligera                             |
| Better Auth  | 1.5.x   | Autenticación + RBAC                                        |
| Node.js      | >=20.19 | Runtime de ejecución                                        |
| NodeMailer   | Última  | Motor de notificaciones por email                           |
| PostgreSQL   | 16.x    | Base de datos relacional en la nube (Vercel)                |

---

# 🧱 Arquitectura General

```text
CLIENTE (Astro + Tailwind 4)
│
├── UI Semántica (Layouts + Slots)
├── Gestión de Sesión (Better-Auth React SDK)
├── Validación de Archivos (Frontend-side validation)
└── Interfaz Dinámica (Bento Grids & Dashboard)
│
▼
SERVIDOR (Astro SSR en Node.js)
│
├── API Routes (/auth, /upload, /contacto)
├── Middleware de Seguridad (RBAC con protectRoute)
├── Gestión de Archivos (fs/promises + Path validation)
└── Prisma Client (Patrón Singleton para evitar colisiones)
│
▼
DATOS Y PERSISTENCIA
│
├── SQLite (Persistencia relacional. Usada en Local)
├── PostgreSQL (Base de datos relacional en la nube (Vercel). Usada en producción)
├── Local Storage (/public/uploads con sanitización de nombres). Usada en Local
└── Local Storage (Vercel Blob o File System según entorno)
```

# 📂 Estructura del Proyecto

```text
/
├── prisma/
│   ├── schema.prisma   # Esquema relacional (User, Session, Archivo, Mensaje)
│   └── dev.db          # Base de datos local
│
├── public/
│   └── uploads/        # Directorio de almacenamiento de archivos STL
│
├── src/
│   ├── components/
│   │   ├── Navbar.astro        # Navegación dinámica por rol
│   │   ├── ContactForm.astro   # Formulario con Honeypot anti-spam
│   │   ├── LoginForm.astro     # Lógica de acceso con feedback animado
│   │   └── Footer.astro        # Pie de página corporativo
│   │
│   ├── layouts/
│   │   └── Layout.astro        # Marco global (SEO, Fuentes, Semántica)
│   │
│   ├── lib/
│   │   ├── prisma.ts   # Singleton de Prisma para optimizar conexiones
│   │   ├── auth.ts     # Configuración Servidor de Better-Auth
│   │   └── auth-client.ts # Cliente de autenticación para el frontend
│   │
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/[...all].ts   # Endpoint central de identidad
│   │   │   ├── upload.ts          # Gestión segura de archivos STL
│   │   │   └── contacto/enviar.ts # Procesamiento de mensajes
│   │   │
│   │   ├── dashboard/
│   │   │   ├── admin/      # Vistas de gestión de laboratorio
│   │   │   └── cliente/    # Vistas de seguimiento de trabajos
│   │   │
│   │   └── index.astro     # Landing page principal
│   │
│   └── styles/
│       └── global.css      # Tailwind 4 + Configuración de Inter Variable
│
├── astro.config.mjs
├── package.json
└── README.md
```

# 🔐 Autenticación y Control de Acceso (RBAC)

Sistema basado en Better Auth con validación en servidor.

- Registro/Login: Validación segura y hashing de contraseñas.
- Roles: Diferenciación entre admin y user (cliente).
- Middleware: Función protectRoute para blindar rutas del Dashboard.
- Honeypot Anti-Bot: Protección invisible en formularios de contacto.
- Seguridad de Archivos: Validación de peso (20MB), extensión (.stl) y sanitización de nombres en servidor.
- Redirecciones automáticas tras login
- Navbar dinámico según sesión

# Endpoints de Autenticación

| Acción   | Ruta                    | Método |
| -------- | ----------------------- | ------ |
| Registro | /api/auth/sign-up/email | POST   |
| Login    | /api/auth/sign-in/email | POST   |
| Sesión   | /api/auth/get-session   | GET    |
| Logout   | /api/auth/sign-out      | POST   |

# 🛡️ Seguridad y Protección de Datos

Se han implementado medidas específicas para garantizar la integridad del servidor:

    Protección en Subida de Archivos:

        Límite de tamaño: Máximo 20MB por archivo para evitar ataques de agotamiento de disco.

        Límite de cantidad: Máximo 10 archivos por operación.

        Validación de Tipo: Filtro estricto de extensiones .stl mediante metadatos del archivo.

        Sanitización: Renombrado automático con Date.now() para evitar colisiones y ataques de sobrescritura.

    Seguridad en Formularios:

        Honeypot Anti-Bot: Campo invisible que invalida peticiones automáticas de SPAM.

        Feedback de UI: Animaciones de "Shake" en errores y bloqueos de botón de envío para evitar double-submit.

    Base de Datos:

        Prevención de SQL Injection: Uso intrínseco de Prisma con consultas parametrizadas.

        Optimización de Conexiones: Patrón Singleton en la instancia de Prisma para entornos de desarrollo con Hot Reload.

# 📊 Base de Datos y Trazabilidad

El esquema de base de datos permite un seguimiento completo del flujo de trabajo dental:

    Usuario: Almacena credenciales, roles y perfil profesional.

    Archivo: Vincula archivos físicos en disco con registros en BD, incluyendo metadatos de prioridad, estado (pendiente/recibido/completado) y descripción clínica.

    Trazabilidad: Cada archivo y mensaje queda vinculado de forma unívoca a un id_usuario.

# 🛠 Instalación y Puesta en Marcha

1. Clonar repositorio
   git clone https://github.com/Carandainf/proyecto_DAW.git
   cd proyecto_DAW
2. Instalar dependencias
   npm install
3. Variables de entorno (Crear archivo .env)
   DATABASE_URL="tu_url_de_conexion_postgres"
   BETTER_AUTH_SECRET="tu_secreto_largo"
   BETTER_AUTH_URL="https://tu-proyecto.vercel.app"
   # Configuración SMTP
   SMTP_HOST="..."
   SMTP_PORT=465
   SMTP_USER="..."
   SMTP_PASS="..."
4. Base de datos (Local)
   npx prisma db push
   npx prisma generate
5. Despliegue en Vercel
   - Conectar repositorio a Vercel.
   - Configurar Vercel Postgres en el dashboard.
   - Añadir las variables de entorno en "Settings > Environment Variables".
   - Vercel ejecutará automáticamente `npm run build`.

# ⚡ Comandos de Utilidad

Comando Acción
npx prisma studio UI para explorar la DB
npm run build Build de producción
npx prisma db seed Datos iniciales

# 🎨 Configuración Tailwind CSS 4

Configuración CSS-first sin plugins adicionales en Astro:

@import "tailwindcss";

✔ Astro 5 detecta automáticamente Tailwind
✔ No requiere configuración JS adicional

# 🚀 Estado del Desarrollo

✅ Funcionalidades Completadas

    [x] Arquitectura SSR con Astro 5: Generación dinámica en servidor para optimización de carga y SEO.

    [x] Persistencia con Prisma + SQLite: Modelado relacional de datos con tipado estricto.

    [x] Configuración Tailwind 4 (CSS-first): Estilos modernos sin dependencias de configuración en JS.

    [x] Sistema de Autenticación y Roles (RBAC): Gestión completa de sesiones y permisos (Admin / Cliente).

    [x] Middleware de Protección de Rutas: Validación de acceso en servidor mediante protectRoute.

    [x] Navbar Dinámico Inteligente: Interfaz adaptativa según el estado de la sesión y el rol del usuario.

    [x] Seguridad Avanzada en Subida de STL: Control de tamaño (20MB), tipo de archivo y cantidad máxima por subida.

    [x] Registro de Trabajos en BD: Vinculación directa entre archivos físicos y metadatos clínicos.

    [x] Landing Page con Honeypot: Formulario de contacto protegido contra SPAM de forma invisible.

    [x] Sistema de Mensajería con Trazabilidad: Registro de contacto con identificación de administrador y marca de tiempo (timestamp).

    [x] Arquitectura Legal: Cumplimiento normativo RGPD / LSSI (Privacidad, Cookies, Aviso Legal).

    [x] Notificaciones por Email: Configuración de Nodemailer para envíos profesionales de configuración de cuenta.

    [x] Migración a PostgreSQL: Adaptación de esquema y despliegue nativo en Vercel.

    [x] Despliegue en Producción (Vercel): Configuración de entorno Serverless y variables de entorno.

# En progreso

[x] Diseño Visual de la Web: Refinamiento estético del Hero y secciones informativas para el usuario ocasional.

[x] Optimización UX en Transferencias: Estudio e implementación de indicadores de progreso (barras de carga) para subida y descarga de archivos pesados (STL).

[ ] Mejora de Reactividad: Investigación de alternativas ligeras para la actualización de mensajes sin recarga completa de página (evitando sobreingeniería).

# 🔮 Roadmap Técnico (Estudio futuro)

    [ ] API de Descarga Protegida: Capa de seguridad extra para el acceso a archivos en /uploads.

    [ ] Notificaciones de Estado: Avisos visuales rápidos sobre cambios en el proceso de la prótesis.

    [ ] Escalabilidad de Almacenamiento: Migración potencial a servicios S3 o Cloudflare R2 para grandes volúmenes de datos.

# 📎 Documentación Técnica

Para profundizar en los detalles de implementación y diseño, consulta los siguientes archivos:

    CHANGELOG.md → Registro detallado de cambios, hitos y evolución de versiones.

    DEV_NOTES.md → Diario técnico con las decisiones de desarrollo y resolución de problemas.

    PROJECT_ARCHITECTURE.md → Diagramas de flujo y arquitectura de la solución SSR.

    DATABASE_DESIGN.md → Diccionario de datos y diseño del esquema relacional (Prisma).

# 🧠 Resumen Técnico (TL;DR)

    Frontend: Astro 5 + Tailwind 4 + TypeScript + Inter Variable.

    Backend: Astro SSR (Node.js) + API Routes + Nodemailer (SMTP).

    Auth: Better Auth + RBAC (Roles) + Middleware.

    ORM/DB: Prisma 7 + SQLite (better-sqlite3). En local

    ORM/DB: Prisma 7 + PostgreSQL (Vercel Postgres). En producción

    Storage: File System local con sanitización y validación de metadatos. En local

    Storage: Vercel Blob o File System según entorno. En Vercel

    Seguridad: protectRoute (Servidor) + Honeypot (Cliente) + CSRF Protection.

---
