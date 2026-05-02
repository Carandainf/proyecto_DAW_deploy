# 📚 DEV_NOTES.md

> Guía técnica detallada del proyecto DAW: Sistema de Laboratorio Dental.
>
> Última actualización: `23/04/2026` · Versión actual: `v0.8.5`

---

# 🗓 Historial y Actualizaciones

```text

| Fecha      | Versión | Descripción                                                           |
| :---       | :---    | :---------------------------------------------------------------------|
| 02/05/2026 | v0.9.0  | Despliegue en Producción.** Migración de SQLite a PostgreSQL (Vercel  Postgres). Configuración de variables de entorno para entorno Serverless.                      |
| 23/04/2026 | v0.8.5  | UX y Comunicaciones. Integración de Nodemailer para envíos SMTP. Refuerzo de seguridad en subida de archivos (límites de 20MB y validación de extensiones).     |
| 12/04/2026 | v0.8.5  | Seguridad y Layout. Implementado sistema Honeypot anti-spam. Corrección de arquitectura de Layout (Flexbox Sticky Footer). Creación de rutas legales dinámicas y condicionales.                                                                     |
| 10/04/2026 | v0.8.0  | Trazabilidad Admin. Extensión del esquema Prisma para tracking de gestión de mensajes (id_admin, fecha_gestion).                                                 |
| 07/04/2026 | v0.7.0  | Documentación y DX. Implementada exportación a PDF corporativo con `jsPDF`, configuración avanzada de entorno (`Prettier` + `Astro`) y resolución de conflictos de tipos en formularios.                                                                          |
| 05/04/2026 | v0.6.0 | Gestión de archivos. Implementado endpoint de subida STL, almacenamiento físico en `/public/uploads` y vinculación con ID de usuario.                    |
| 03/04/2026 | v0.5.0 | Middleware y roles. Implementada protección `protectRoute`, navbar dinámico y redirecciones automáticas según rol (`Admin` / `Cliente`).                          |
| 01/04/2026 | v0.4.0 | Bento Grid. Interfaz adaptativa en `/test-auth`, corrección de botones y visualización JSON en tiempo real.                                                           |

```

---

# 1. ⚙️ Configuración del Entorno de Desarrollo (DX)

Objetivo: mantener consistencia de formato, evitar conflictos de indentación y asegurar compatibilidad con archivos `.astro`.

## Extensiones Requeridas

- `astro-build.astro-vscode` → Formateador oficial de Astro.
- `esbenp.prettier-vscode` → Motor de reglas y formato.

## Dependencias NPM

```bash
npm install -D prettier prettier-plugin-astro
```

## Configuración recomendada de VS Code / Antigravity

```json
{
  "editor.formatOnSave": true,
  "[astro]": {
    "editor.defaultFormatter": "astro-build.astro-vscode"
  }
}
```

## Resultado Esperado

- Autoformateo al guardar.
- Compatibilidad total con componentes Astro.
- Eliminación de errores de indentación y formato inconsistentes.

---

# 2. 🗄 Cliente Prisma Global (Singleton)

**Archivo:** `src/lib/prisma.ts`

Se utiliza un patrón Singleton para evitar el agotamiento de conexiones a la base de datos durante el `Hot Reload` en desarrollo.

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// En producción la conexión ahora utiliza el adapter nativo de PostgreSQL para Vercel
export const prisma = globalForPrisma.prisma ?? new PrismaClient({});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

## Beneficios

- Evita múltiples instancias de `PrismaClient`.
- Reduce fugas de memoria y errores de conexión.
- Compatible con SSR y recarga en caliente.

---

# 3. 🔐 Lógica de Autenticación y Roles

## Configuración de Roles Dinámicos

**Archivo:** `src/lib/auth.ts`

Se habilita la entrada del rol desde el frontend para facilitar pruebas de distintos perfiles durante el registro.

```ts
additionalFields: {
  role: {
    type: "string",
    required: false,
    defaultValue: "user",
    input: true
  }
}
```

### Comportamiento

- Si no se envía un rol, se asigna `user`.
- El frontend puede enviar `admin`, `cliente`, etc.
- Útil para pruebas internas y entornos de staging.

---

## Protección de Rutas

La función `protectRoute(request, role)` centraliza la seguridad de acceso.

### Responsabilidades

1. Verificar que exista una sesión activa.
2. Obtener el rol del usuario autenticado.
3. Comparar el rol requerido con el rol actual.
4. Retornar una redirección si el acceso no es válido.

```ts
const result = await protectRoute(request, "admin");

if (result.redirect) {
  return result.redirect;
}
```

### Flujo de Acceso

```text
Usuario → Login → Validación de sesión → Validación de rol
       → Acceso permitido / Redirección automática
```

---

# 4. 📄 Gestión Documental: Generación de PDF

Se implementa la exportación del historial utilizando:

- `jsPDF`
- `jspdf-autotable`

## Arquitectura

La generación del PDF ocurre en el cliente (`client-side`) para reducir carga del servidor.

```ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
```

## Transferencia de Datos

Astro inyecta directamente los datos de la base de datos al navegador mediante:

```astro
define:vars={{ todosLosTrabajos }}
```

Esto evita llamadas API adicionales para construir el documento.

## Diseño Visual del PDF

| Elemento           | Color               |
| ------------------ | ------------------- |
| Acentos            | `#06B6D4`           |
| Cabeceras de tabla | `#020617`           |
| Fondo / Contraste  | Blanco + Gris suave |

## Objetivo

Generar un PDF profesional, alineado con la identidad visual del proyecto y descargable desde el historial de trabajos.

---

# 5. 🌐 Endpoints de API y Flujo de Datos

## Autenticación Oficial

Se utiliza el endpoint catch-all de Better Auth:

```text
src/pages/api/auth/[...all].ts
```

Responsabilidad:

- Login
- Logout
- Registro
- Recuperación de sesión
- Middleware interno de autenticación

---

## Subida de Archivos

**Archivo:** `src/pages/api/upload.ts`

### Flujo

1. Recibe `multipart/form-data`.
2. Renombra el archivo usando un timestamp único.
3. Guarda el fichero en:

```text
/public/uploads
```

4. Vincula el archivo al usuario autenticado.

### Ejemplo de nombre generado

```text
1744012301234-modelo.stl
```

---

## Seguridad en Peticiones Fetch

Todas las peticiones desde el cliente deben incluir:

```ts
fetch("/api/upload", {
  method: "POST",
  credentials: "include",
  body: formData,
});
```

### Motivo

`credentials: "include"` garantiza que las cookies de sesión viajen junto a la petición.

Sin esta opción:

- El backend no detecta la sesión.
- El usuario aparece como no autenticado.
- La petición puede fallar con `401 Unauthorized`.

---

# 6. 📤 Gestión Segura de Archivos (STL)

Archivo: src/pages/api/upload.ts

Se implementó una lógica de subida robusta para evitar ataques de denegación de servicio (DoS) o inyección de archivos:

    Validación de Peso: Límite estricto de 20MB.

    Validación de Tipo: Solo archivos con extensión .stl.

    Sanitización de Nombres: Uso de Date.now() + "-" + originalName para evitar sobrescritura y ataques de Path Traversal.

    Persistencia: Registro en la base de datos vinculado al userId de la sesión activa.

---

# 7. 📧 Comunicaciones con Nodemailer

Se ha integrado un transporte SMTP para profesionalizar el flujo de contacto:

    Flujo: Formulario de contacto → Validación Honeypot → Envío de Email real al administrador → Registro en DB para trazabilidad.

    Configuración: Uso de variables de entorno para SMTP_HOST y SMTP_PASS, garantizando que las credenciales nunca se suban al repositorio.

---

# 8. 🧯 Solución de Errores Críticos (Troubleshooting)

## Error `ts(2345)`

Problema habitual al acceder a `e.target` dentro de formularios.

### Solución

```ts
const target = e.target as HTMLFormElement;
```

---

## Error `ts(18046)`

TypeScript considera `err` como `unknown` dentro de `catch`.

### Solución

```ts
catch (err) {
  if (err instanceof Error) {
    console.error(err.message);
  }
}
```

---

## Detección Incorrecta de Rol Tras Login

Problema:

- El usuario inicia sesión.
- La redirección ocurre antes de que el cliente conozca el rol actualizado.

### Solución Aplicada

Forzar una llamada adicional a `get-session` inmediatamente después del login.

```ts
await authClient.getSession();
```

Esto asegura que el rol ya esté disponible antes de decidir la redirección.

---

# 9. 🛡️ Seguridad en Formularios: Estrategia Honeypot

Para el formulario de contacto se ha evitado el uso de Captchas intrusivos, optando por una técnica de Honeypot.
Implementación Técnica

    Se añade un campo de texto oculto mediante CSS (display: none o fuera del viewport).

    Se le asigna un nombre genérico atractivo para bots (ej: fax_number).

    En el backend (/api/contacto/enviar.ts), se valida:

    ```typescript

    const honey = formData.get("fax_number");
    if (honey) return new Response("Bot detectado", { status: 400 });
    ```

---

# 10. 📐 Solución de Layout y Renderizado (Slots)

## El problema del "Layout Cerrado"

Se detectó un bug donde el Footer aparecía en la cabecera o el contenido quedaba fuera del DOM esperado.
Causa: Uso de etiquetas de autocierre en el componente Layout (<Layout />).
Solución: Los Layouts en Astro deben envolver el contenido para que el slot funcione correctamente.

Fragmento de código:

<Layout title="Dashboard" />
<Navbar /> <Layout title="Dashboard">
  <Navbar />
  <main>...</main>
</Layout>

## Sticky Footer (Flexbox)

Para evitar que el footer flote en mitad de la pantalla en páginas con poco contenido (como las legales), se aplicó la siguiente estructura en Layout.astro:

```html
<body class="flex flex-col min-h-screen">
  <div class="flex-grow">
    <slot />
  </div>
  <footer />
</body>
```

---

11. ⚖️ Gestión de Rutas Legales

Se ha implementado una lógica de filtrado de rutas en el Layout principal para ocultar componentes innecesarios en páginas de lectura legal (Aviso Legal, Privacidad, Cookies).

Lógica Condicional

```typescript
const legalPaths = ["/privacidad", "/aviso-legal", "/cookies"];
const isLegalPage = legalPaths.includes(Astro.url.pathname);
```

Esto permite renderizar un footer simplificado o directamente eliminarlo para mejorar la UX en documentos oficiales.

---

12. 📋 Troubleshooting de Base de Datos
    Error de Conexión en Desarrollo

Si al realizar cambios en el esquema Prisma (npx prisma db push) los tipos de TypeScript no se actualizan en VS Code:

Comando de rescate:

```bash
npx prisma generate
```

Y reiniciar el Language Server de TypeScript en el IDE (Cmd/Ctrl + Shift + P -> Restart TS Server).

---

# 13. ☁️ Despliegue en Producción (Vercel)

Se ha migrado la infraestructura de un entorno local (SQLite) a un entorno Serverless (PostgreSQL).

## Consideraciones Técnicas:

- **Base de Datos:** Migración a Vercel Postgres (Neon) para persistencia en la nube.
- **Variables de Entorno:** Todas las credenciales (DB, Auth, SMTP) han sido movidas al dashboard de Vercel.
- **Generación de PDF:** Mantenido en `client-side` (jsPDF) para evitar límites de memoria en funciones Serverless.
- **Estrategia de Build:** `prisma generate` se ejecuta en el `postinstall` para asegurar que el cliente esté listo en el entorno de Vercel.

---

# 📎 Resumen Técnico

```text
Frontend: Astro + TypeScript
Auth: Better Auth
ORM: Prisma
Storage: /public/uploads
PDF: jsPDF + jspdf-autotable
SSR: output = "server"
RBAC: protectRoute(request, role)
```

# 🚀 Estado Actual del Proyecto (v0.8.5)

## 🏷️ Leyenda de Estados

```text

| Estado | Significado   |
| ------ | ------------- |
| ✅     | Completado    |
| 🚧     | En desarrollo |
| 📅     | Planificado   |

```

---

## 📊 Estado por Módulo

```text
| Módulo               | Descripción                                               | Estado |
| -------------------- | ----------------------------------------------------------|------- |
| Arquitectura SSR     | Astro 5 con `output: "server"` y persistencia en SQLite   | ✅     |
| Auth & RBAC          | Sistema de roles (`admin` / `user`) con Better Auth 1.5   | ✅     |
| Seguridad Anti-Spam  | Protección de formularios mediante técnica Honeypot
                       | (sin Captchas)                                            | ✅     |
| Capa Legal RGPD      | Páginas de Privacidad, Aviso Legal y Cookies (técnicas)   | ✅     |
| Layout Robusto       | Estructura Flexbox (Sticky Footer) y corrección de Slots  | ✅     |
| Gestión de Archivos  | Subida de archivos `.stl` con renombrado único y vínculo
                       | a Prisma                                                  | ✅     |
| Exportación PDF      | Generación de informes profesionales en cliente con jsPDF | ✅     |
| Dashboard Cliente    | Panel de actividad, historial y envío de trabajos         | ✅     |
| Dashboard Admin      | Gestión global, trazabilidad de mensajes y control de
                       | estados                                                   | ✅     |
| DX & Tooling         | Prettier, Astro Plugin y tipado estricto con TypeScript   | ✅     |
| Integración de Email | NodeMailer                                                | ✅     |
| Landing Page         | Hero y tipografías                                        | ✅     |

```

---

# Próximos Pasos 🚧

```text
    UX de Transferencia: Implementar indicadores de carga visuales para archivos grandes.

    Optimización de Mensajería: Investigar patrones de actualización parcial para el chat de trabajos sin recarga de página (evitando sobreingeniería).
```

---
