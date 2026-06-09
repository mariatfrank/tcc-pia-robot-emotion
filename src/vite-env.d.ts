/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_LAN_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

