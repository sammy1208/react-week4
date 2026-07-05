/// <reference types="vite/client" />

declare module "*.scss";

interface ImportMetaEnv {
  readonly VITE_SECRET_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
