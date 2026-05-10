# 🚀 Memoria de Ajustes para Producción (Render.com)

Este documento detalla las modificaciones técnicas realizadas para garantizar el correcto funcionamiento de la plataforma en el entorno de producción de **Render**, migrando desde la configuración inicial orientada a hosting serverless (Vercel).

---

## 🛠 Cambios Técnicos Realizados

### 1. Cambio de Adaptador de Despliegue

Para permitir la ejecución de un servidor persistente y el manejo correcto de la lógica de backend:

- **Eliminación:** Se descartó el adaptador `@astrojs/vercel`.
- **Implementación:** Se instaló y configuró el adaptador `@astrojs/node` en modo `standalone`.

### 2. Reconfiguración de `astro.config.mjs`

Se ajustó el archivo de configuración del framework para cumplir con los requisitos de red de Render:

- **Host & Port:** Se forzó la escucha en el host `0.0.0.0` y el puerto `10000` para permitir la visibilidad externa del servicio.
- **Network Binding:** Activación del modo de ejecución independiente para el entorno de Node.js.

### 3. Ajustes de Tipado y Frontend

Se resolvieron conflictos de compilación en los scripts del lado del cliente:

- **Corrección de Errores TypeScript:** Eliminación de errores en la lógica de filtrado de tablas y generación de reportes PDF.
- **Casting de Tipos:** Se aplicó tipado estricto (`HTMLInputElement`, `HTMLElement`) para asegurar la compatibilidad con el motor de construcción (Build Engine).

### 4. Optimización del Pipeline de Construcción (CI/CD)

Se redefinieron los comandos de despliegue para asegurar la integridad de la base de datos:

- **Build Command:** ```bash
  npm install && npx prisma generate && npm run build
- **Start Command:** ```bash
  node ./dist/server/entry.mjs

### 5. Gestión de Variable de Entorno

Configuración centralizada en el Dashboard de Rende:

- **Migración de claves secretas y URLs de conexión (Prisma/Neon).**
- **Better Auth:** Actualización de la variable BETTER_AUTH_URL al dominio final de producción: (https://proyecto-daw-deploy.onrender.com)

### 6. Acceso a la Plataforma y Estado del Servidor

La aplicación es totalmente pública y accesible a través del siguiente dominio:

- **URL Oficial:** https://proyecto-daw-deploy.onrender.com

> **Nota sobre el rendimiento:** Al utilizar una instancia gratuita (_Free Tier_) de Render, el servidor entra en estado de reposo tras 15 minutos de inactividad. Si es la primera vez que se accede en mucho tiempo, es posible que la web tarde entre **30 y 50 segundos** en responder mientras el servicio se reinicia ("Spin up"). Una vez despierto, el rendimiento es fluido y constante.
