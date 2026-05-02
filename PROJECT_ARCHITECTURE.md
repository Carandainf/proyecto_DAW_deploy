# 🏗️ PROJECT_ARCHITECTURE.md

> Arquitectura técnica del proyecto DAW: Sistema de Gestión de Laboratorio Dental.

> Última actualización: `23/04/2026` · Versión actual: `v0.8.5`

---

# 📦 Stack Tecnológico

| Tecnología   | Versión | Uso                                              |
| ------------ | ------- | ------------------------------------------------ |
| Astro        | 5.x     | Framework principal con renderizado SSR          |
| TypeScript   | Última  | Tipado estricto en toda la aplicación            |
| Tailwind CSS | 4.x     | Sistema de estilos nativo y variables CSS        |
| Prisma       | 7.x     | ORM para acceso a SQLite (Local)                 |
| Better Auth  | 1.5.x   | Autenticación, sesión y RBAC                     |
| jsPDF        | Última  | Generación de informes PDF en cliente            |
| SQLite       | 3.x     | Base de datos relacional ligera. En local        |
| PostgreSQL   | 16.x    | Base de datos relacional. En producción (Vercel) |
| NodeMailer   | Última  | Motor de notificaciones por email                |

---

# 1. 🧱 Arquitectura de Capas y Flujos

El sistema se divide en cuatro capas claramente diferenciadas para asegurar la escalabilidad:

A. Capa de Presentación (UI)

      Astro Islands: Uso de componentes estáticos para el contenido y componentes hidratados solo donde es necesario.

      Bento Grid Layout: Estructura visual para el Dashboard de administración.

B. Capa de Aplicación (Servidor Astro)

      API Routes: Endpoints dedicados para:

          /api/auth/*: Ciclo de vida de la sesión.

          /api/upload: Lógica de recepción de archivos STL con validación de metadatos.

          /api/contacto: Procesamiento de mensajes con integración de email.

      Middleware: Validación de privilegios antes de renderizar rutas protegidas.

C. Capa de Seguridad (Multi-nivel)

      Frontend: Honeypot invisible en formularios para mitigación de bots.

      Transferencia: Validación en servidor de archivos (máx. 20MB, extensión .stl, sanitización de nombres).

      Acceso: Cookies httpOnly gestionadas por Better Auth.

D. Capa de Datos (Prisma + SQLite) en local y (Prisma + PostgreSQL) en producción.

      Patrón Singleton: Garantiza una única instancia de conexión a la base de datos.

      Esquema Relacional: Trazabilidad completa entre el usuario facultativo y sus archivos y/o mensajes. En producción alojado en Vercel Blob.

---

# 2. 🔐 Sistema de Seguridad y Roles (RBAC)

El control de acceso se centraliza mediante:

````ts
protectRoute(request, role)

Niveles de validación
Validación de sesión:
Verifica la cookie de Better Auth en cada request
Validación de rol:
Compara role (admin | user) con el requerido
Matriz de acceso
Usuario	Destino Permitido	Capa Legal
admin	/dashboard/admin	Acceso a gestión global
user	/dashboard/cliente	Acceso a sus pedidos
público	/	Formulario con Honeypot

# 3. 📂 Estructura del Proyecto

```text
/
├── prisma/
│   └── schema.prisma       # Esquema relacional (PostgreSQL)
│
├── public/
│   └── uploads/            # Almacenamiento de archivos STL
│
├── src/
│   ├── components/
│   │   ├── ContactForm.astro
│   │   ├── Faq.astro            # Nueva sección de ayuda
│   │   ├── Footer.astro
│   │   ├── Hero.astro           # Componente principal de entrada
│   │   ├── LoginForm.astro
│   │   ├── Navbar.astro
│   │   ├── ServiciosBento.astro # Layout tipo Bento para servicios
│   │   ├── TeamBento.astro      # Layout tipo Bento para el equipo
│   │   └── TechStack.astro      # Visualización del stack tecnológico
│   │
│   ├── layouts/
│   │   └── Layout.astro
│   │
│   ├── lib/
│   │   ├── prisma.ts           # Cliente Prisma (PostgreSQL)
│   │   ├── auth.ts             # Configuración Servidor Better-Auth
│   │   └── auth-client.ts      # Cliente de autenticación
│   │
│   ├── pages/
│   │   ├── api/                # Endpoints (Auth, Upload, Contacto)
│   │   ├── dashboard/
│   │   │   ├── admin/          # Gestión laboratorio
│   │   │   └── cliente/        # Área privada dentistas
│   │   ├── index.astro         # Landing principal
│   │   ├── 404.astro
│   │   ├── aviso-legal.astro
│   │   ├── cookies.astro
│   │   ├── forgot-password.astro
│   │   ├── privacidad.astro
│   │   └── reset-password.astro
│   │
│   ├── styles/
│   │   └── global.css
│   └── types/                  # Definiciones de tipos (TS)
│
├── astro.config.mjs
├── package.json
└── README.md
````

# 4. 🗄️ Modelo de Datos y Trazabilidad

El diseño de la base de datos pone especial énfasis en la trazabilidad clínica:

    Entidad Archivo: No solo almacena la ruta del STL, sino también el estado del proceso (pendiente, recibido, completado) y la prioridad.

    Entidad Mensaje: Incluye campos para la gestión administrativa:

        id_admin: Quién ha gestionado la consulta.

        fecha_gestion: Marca de tiempo de la respuesta.

        leido: Flag de control para el flujo de trabajo del laboratorio.

# 5. ⚖️ Cumplimiento Legal (LSSI-CE / RGPD)

Cumplimiento normativo integrado en el diseño:

    RGPD: Implementación de persistencia de datos bajo consentimiento en el registro.

    LSSI-CE: Páginas legales dinámicas que se excluyen del indexado de búsqueda en el Footer si es necesario.

    Cookies: Sistema de identidad basado únicamente en cookies técnicas esenciales.

# 6. 🚀 Estado de la Implementación

Área Estado Detalle
Autenticación (RBAC) ✅ Completado Registro, Login y Roles operativos.
Dashboards (Admin/User) ✅ Completado Paneles funcionales y vinculados a DB.
Seguridad de Archivos ✅ Completado Validación de tamaño, tipo y sanitización.
Sistema de Contacto ✅ Completado Honeypot + Integración Nodemailer.
Arquitectura Legal ✅ Completado Footer condicional y textos legales.
Refinamiento UI ✅ Completado Pulido estético de la landing page.
Base de datos ✅ Completado Conexión a PostgreSQL y Vercel Blob.
UX de Transferencia 📅 Planificado Barras de progreso para subida de STL.

# 📎 Resumen Arquitectónico

Frontend → Astro (SSR) + Tailwind 4 + TypeScript
Backend → API Routes (Node.js) + NodeMailer
Auth → Better Auth + RBAC
Security → Honeypot + Middlewares
Persistencia → Prisma ORM + SQLite --->Local
Persistencia → Prisma ORM + PostgreSQL (Vercel Postgres) ---> Producción

```

```
