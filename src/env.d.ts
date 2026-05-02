/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_BETTER_AUTH_URL: string;
  readonly DATABASE_URL: string;
  // Añade aquí cualquier otra variable que uses en tu código
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
