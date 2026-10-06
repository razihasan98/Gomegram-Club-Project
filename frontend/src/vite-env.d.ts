/// <reference types="vite/client" />

declare module 'libheif-js/wasm-bundle' {
  const libheif: any;
  export default libheif;
}

declare module 'heic2any' {
  interface Heic2AnyOptions {
    blob: Blob | File;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  }
  function heic2any(options: Heic2AnyOptions): Promise<Blob | Blob[]>;
  export default heic2any;
}
